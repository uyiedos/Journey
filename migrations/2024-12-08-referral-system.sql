-- Migration: Referral System Setup
-- Date: 2024-12-08
-- Description: Creates tables and functions for the referral system

-- 1. Add referral_code column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'referral_code') THEN
    ALTER TABLE public.users ADD COLUMN referral_code TEXT;
    CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
  END IF;
END $$;

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'expired')),
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(referred_id),
  UNIQUE(referrer_id, referred_id)
);

-- 3. Create referral_activities table to track referral-related activities
CREATE TABLE IF NOT EXISTS public.referral_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'completed', 'expired', 'points_awarded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  unique_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Get user's username or email for base code
  SELECT COALESCE(username, SPLIT_PART(email, '@', 1)) INTO base_code
  FROM public.users
  WHERE id = user_id;
  
  -- Clean up the base code
  base_code := LOWER(REGEXP_REPLACE(base_code, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Ensure it's not empty
  IF base_code = '' OR base_code IS NULL THEN
    base_code := 'user';
  END IF;
  
  -- Truncate to reasonable length
  base_code := SUBSTRING(base_code, 1, 8);
  
  -- Make sure it's unique
  unique_code := base_code;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE referral_code = unique_code) LOOP
    unique_code := base_code || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN unique_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to create referral
CREATE OR REPLACE FUNCTION public.create_referral(referrer_id UUID, referred_id UUID, referral_code TEXT)
RETURNS JSON AS $$
DECLARE
  new_referral UUID;
  existing_referral RECORD;
BEGIN
  -- Check if referred user already has a referral
  SELECT * INTO existing_referral
  FROM public.referrals
  WHERE referred_id = referred_id;
  
  IF existing_referral IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREFERRED',
      'message', 'User has already been referred'
    );
  END IF;
  
  -- Create new referral
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code)
  VALUES (referrer_id, referred_id, referral_code)
  RETURNING id INTO new_referral;
  
  -- Log activity
  INSERT INTO public.referral_activities (referral_id, activity_type, description)
  VALUES (new_referral, 'created', 'Referral created');
  
  RETURN json_build_object(
    'success', true,
    'referral_id', new_referral,
    'message', 'Referral created successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create function to complete referral and award points
CREATE OR REPLACE FUNCTION public.complete_referral(referral_id UUID, points_to_award INTEGER DEFAULT 50)
RETURNS JSON AS $$
DECLARE
  referral_data RECORD;
  referrer_points INTEGER;
BEGIN
  -- Get referral data
  SELECT * INTO referral_data
  FROM public.referrals
  WHERE id = referral_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NOTFOUND',
      'message', 'Referral not found or already completed'
    );
  END IF;
  
  -- Check if referral has expired
  IF referral_data.expires_at < NOW() THEN
    UPDATE public.referrals
    SET status = 'expired', completed_at = NOW()
    WHERE id = referral_id;
    
    INSERT INTO public.referral_activities (referral_id, activity_type, description)
    VALUES (referral_id, 'expired', 'Referral expired');
    
    RETURN json_build_object(
      'success', false,
      'error', 'EXPIRED',
      'message', 'Referral has expired'
    );
  END IF;
  
  -- Update referral status
  UPDATE public.referrals
  SET status = 'completed', 
      points_awarded = points_to_award,
      completed_at = NOW()
  WHERE id = referral_id;
  
  -- Award points to referrer
  PERFORM public.increment_points(referral_data.referrer_id, points_to_award);
  
  -- Log activities
  INSERT INTO public.referral_activities (referral_id, activity_type, description, metadata)
  VALUES 
    (referral_id, 'completed', 'Referral completed', json_build_object('points_awarded', points_to_award)),
    (referral_id, 'points_awarded', 'Points awarded to referrer', json_build_object('points', points_to_award));
  
  RETURN json_build_object(
    'success', true,
    'points_awarded', points_to_award,
    'message', 'Referral completed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to get referral stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  stats RECORD;
BEGIN
  SELECT 
    COUNT(*) as total_referrals,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
    COALESCE(SUM(points_awarded), 0) as points_earned
  INTO stats
  FROM public.referrals
  WHERE referrer_id = user_id;
  
  RETURN json_build_object(
    'total_referrals', stats.total_referrals,
    'completed_referrals', stats.completed_referrals,
    'pending_referrals', stats.pending_referrals,
    'points_earned', stats.points_earned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable RLS on referral tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activities ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can insert own referrals" ON public.referrals;

DROP POLICY IF EXISTS "Users can view own referral activities" ON public.referral_activities;

-- 10. Create RLS policies for referrals table
CREATE POLICY "Users can view own referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert own referrals" 
  ON public.referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

-- 11. Create RLS policies for referral_activities table
CREATE POLICY "Users can view own referral activities" 
  ON public.referral_activities 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_activities.referral_id
      AND (r.referrer_id = auth.uid() OR r.referred_id = auth.uid())
    )
  );

-- 12. Grant permissions
GRANT SELECT, INSERT ON public.referrals TO authenticated;
GRANT SELECT ON public.referral_activities TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.generate_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_referral(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_referral(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_stats(UUID) TO authenticated;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_activities_referral_id ON public.referral_activities(referral_id);

-- 14. Auto-generate referral codes for existing users without one
UPDATE public.users
SET referral_code = public.generate_referral_code(id)
WHERE referral_code IS NULL OR referral_code = '';

-- 15. Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Referral system migration completed successfully!';
  RAISE NOTICE 'Tables created: referrals, referral_activities';
  RAISE NOTICE 'Functions created: generate_referral_code, create_referral, complete_referral, get_referral_stats';
  RAISE NOTICE 'RLS policies created and enabled';
  RAISE NOTICE 'Permissions granted to authenticated users';
  RAISE NOTICE 'Indexes created for performance';
  RAISE NOTICE 'Referral codes generated for existing users';
END $$;
