-- Migration: Fix Daily Points System
-- Date: 2024-12-09
-- Description: Create RPC function for daily points and fix RLS policies

-- 1. Update the existing daily_login_rewards table to add missing columns
DO $$
BEGIN
  -- Add reward_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_login_rewards' AND column_name = 'reward_date') THEN
    ALTER TABLE public.daily_login_rewards ADD COLUMN reward_date DATE NOT NULL DEFAULT NOW()::DATE;
  END IF;

  -- Add streak_day column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'daily_login_rewards' AND column_name = 'streak_day') THEN
    ALTER TABLE public.daily_login_rewards ADD COLUMN streak_day INTEGER NOT NULL DEFAULT 1;
  END IF;

  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_name = 'daily_login_rewards' AND constraint_name = 'daily_login_rewards_user_id_reward_date_key') THEN
    ALTER TABLE public.daily_login_rewards ADD CONSTRAINT daily_login_rewards_user_id_reward_date_key UNIQUE(user_id, reward_date);
  END IF;
END $$;

-- 2. Enable RLS on daily_login_rewards
ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own daily rewards" ON public.daily_login_rewards;
DROP POLICY IF EXISTS "Users can insert own daily rewards" ON public.daily_login_rewards;

-- 4. Create RLS policies for daily_login_rewards
CREATE POLICY "Users can view own daily rewards" 
ON public.daily_login_rewards
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily rewards" 
ON public.daily_login_rewards
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Create the RPC function for claiming daily points
CREATE OR REPLACE FUNCTION public.claim_daily_points_rpc(
  p_user_id UUID,
  p_points_to_add INTEGER,
  p_new_points INTEGER,
  p_new_level INTEGER,
  p_new_streak INTEGER,
  p_now TIMESTAMPTZ
) RETURNS JSON AS $$
DECLARE
  result JSON;
  last_claim TIMESTAMPTZ;
  hours_since_last_claim NUMERIC;
  actual_new_streak INTEGER;
  current_points INTEGER;
BEGIN
  -- Get last claim time and current points
  SELECT MAX(dlr.created_at), u.points
  INTO last_claim, current_points
  FROM public.daily_login_rewards dlr
  LEFT JOIN public.users u ON u.id = p_user_id
  WHERE dlr.user_id = p_user_id;

  -- Check if already claimed today
  IF last_claim IS NOT NULL THEN
    hours_since_last_claim := EXTRACT(EPOCH FROM (p_now - last_claim)) / 3600;
    
    IF hours_since_last_claim < 24 THEN
      RETURN json_build_object(
        'success', false,
        'error', 'ALREADY_CLAIMED',
        'message', 'Daily points already claimed today',
        'next_claim_in_hours', 24 - hours_since_last_claim
      );
    END IF;
  END IF;

  -- Calculate new streak
  IF last_claim IS NULL THEN
    actual_new_streak := 1;
  ELSIF hours_since_last_claim <= 48 THEN
    actual_new_streak := p_new_streak + 1;
  ELSE
    actual_new_streak := 1;
  END IF;

  -- Calculate actual new points
  current_points := COALESCE(current_points, 0);
  p_new_points := current_points + p_points_to_add;
  p_new_level := FLOOR(p_new_points / 100) + 1;

  -- Update user points and last claim using a safer approach
  BEGIN
    -- Try direct update first
    UPDATE public.users
    SET 
      points = p_new_points,
      level = p_new_level,
      streak = actual_new_streak,
      longest_streak = COALESCE(longest_streak, 0),
      last_daily_claim = p_now,
      updated_at = p_now
    WHERE id = p_user_id;
    
    -- Check if update succeeded
    IF NOT FOUND THEN
      -- If user doesn't exist in users table, create the record
      INSERT INTO public.users (
        id,
        points,
        level,
        streak,
        longest_streak,
        last_daily_claim,
        updated_at,
        email,
        full_name
      ) SELECT 
        p_user_id,
        p_new_points,
        p_new_level,
        actual_new_streak,
        actual_new_streak,
        p_now,
        p_now,
        email,
        email
      FROM auth.users 
      WHERE id = p_user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If update fails due to RLS, try using the increment_points function
    PERFORM public.increment_points(p_user_id, p_points_to_add);
  END;

  -- Log the reward
  INSERT INTO public.daily_login_rewards (
    user_id,
    reward_date,
    points_awarded,
    streak_day
  ) VALUES (
    p_user_id,
    p_now::DATE,
    p_points_to_add,
    actual_new_streak
  );

  -- Update user stats
  INSERT INTO public.user_stats (
    user_id,
    total_points_earned,
    last_activity_at
  ) VALUES (
    p_user_id,
    p_new_points,
    p_now
  ) ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points_earned = p_new_points,
    last_activity_at = p_now;

  -- Return success with actual values
  RETURN json_build_object(
    'success', true,
    'points', p_new_points,
    'level', p_new_level,
    'streak', actual_new_streak,
    'message', 'Daily points claimed successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'message', 'Database error occurred'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.claim_daily_points_rpc(UUID, INTEGER, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ) TO authenticated;

-- 7. Ensure the function has the correct owner
ALTER FUNCTION public.claim_daily_points_rpc(UUID, INTEGER, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ) OWNER TO postgres;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_user_id ON public.daily_login_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_date ON public.daily_login_rewards(reward_date);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_created_at ON public.daily_login_rewards(created_at DESC);

-- 9. Update users table RLS policies to ensure they work properly
DO $$
BEGIN
  -- Enable RLS on users table if not already enabled
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can view all profiles for leaderboard" ON public.users;
  
  -- Create new policies
  CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
  
  CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
  
  -- Allow public read access for leaderboard view
  CREATE POLICY "Users can view all profiles for leaderboard" ON public.users
  FOR SELECT USING (true);
  
  RAISE NOTICE 'Users table RLS policies updated';
END $$;
