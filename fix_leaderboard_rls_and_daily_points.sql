-- Fix Leaderboard RLS and Add Daily Points Tracking
-- Created: 2024-12-08

-- 1. Add last_daily_points_at column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'users' 
                  AND column_name = 'last_daily_points_at') THEN
        ALTER TABLE public.users 
        ADD COLUMN last_daily_points_at TIMESTAMPTZ;
        
        COMMENT ON COLUMN public.users.last_daily_points_at IS 'Timestamp when user last claimed daily points';
    END IF;
END $$;

-- 2. Create or replace leaderboard view with RLS policies
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.points,
  u.level,
  u.streak,
  u.longest_streak,
  u.last_daily_points_at,
  RANK() OVER (ORDER BY u.points DESC) as rank_position
FROM public.users u
WHERE u.status = 'active';

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view leaderboard" ON public.leaderboard;

-- 4. Create user profile policies
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create leaderboard policy
CREATE POLICY "Users can view leaderboard" ON public.leaderboard
FOR SELECT USING (true); -- Public access to view leaderboard

-- 6. Create or replace function to update leaderboard
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if leaderboard table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'leaderboard') THEN
    
    -- Update or insert into leaderboard
    INSERT INTO public.leaderboard (user_id, points, level, streak, last_updated)
    VALUES (NEW.id, NEW.points, NEW.level, NEW.streak, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = EXCLUDED.points,
      level = EXCLUDED.level,
      streak = EXCLUDED.streak,
      last_updated = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create or replace trigger for user updates
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_user_updated ON public.users;
    
    -- Create the trigger
    EXECUTE 'CREATE TRIGGER on_user_updated
    AFTER UPDATE OF points, level, streak ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leaderboard();';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;

-- 8. Create or replace function to get time until next daily points
CREATE OR REPLACE FUNCTION public.get_time_until_next_daily_points(user_id UUID)
RETURNS INTERVAL AS $$
DECLARE
  last_claim TIMESTAMPTZ;
  next_claim TIMESTAMPTZ;
  time_until_next INTERVAL;
BEGIN
  -- Get last claim time
  SELECT last_daily_points_at INTO last_claim
  FROM public.users
  WHERE id = user_id;
  
  -- If never claimed, can claim now
  IF last_claim IS NULL THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  -- Calculate next claim time (24 hours after last claim)
  next_claim := last_claim + INTERVAL '24 hours';
  
  -- If next claim is in the past, can claim now
  IF next_claim <= NOW() THEN
    RETURN INTERVAL '0 seconds';
  END IF;
  
  -- Otherwise return time until next claim
  RETURN next_claim - NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to claim daily points
CREATE OR REPLACE FUNCTION public.claim_daily_points(user_id UUID, points_to_add INTEGER DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
  last_claim TIMESTAMPTZ;
  result JSONB;
  current_points INTEGER;
  new_level INTEGER;
BEGIN
  -- Get user's current points and last claim time
  SELECT points, last_daily_points_at 
  INTO current_points, last_claim
  FROM public.users 
  WHERE id = user_id
  FOR UPDATE; -- Lock the row for update
  
  -- Check if user can claim (24 hours have passed or never claimed)
  IF last_claim IS NULL OR last_claim < (NOW() - INTERVAL '24 hours') THEN
    -- Calculate new level (100 points per level)
    new_level := (current_points + points_to_add) / 100 + 1;
    
    -- Update user's points, level, and last claim time
    UPDATE public.users
    SET 
      points = points + points_to_add,
      level = new_level,
      last_daily_points_at = NOW()
    WHERE id = user_id
    RETURNING 
      jsonb_build_object(
        'success', true,
        'points', points,
        'level', new_level,
        'next_claim_available', (NOW() + INTERVAL '24 hours')::text
      ) INTO result;
    
    RETURN result;
  ELSE
    -- Calculate time until next claim is available
    RETURN jsonb_build_object(
      'success', false,
      'message', 'You can only claim once every 24 hours',
      'next_claim_available', (last_claim + INTERVAL '24 hours')::text,
      'time_until_next', (last_claim + INTERVAL '24 hours' - NOW())::text
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'An error occurred while processing your claim',
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add comments for documentation
COMMENT ON FUNCTION public.update_leaderboard() IS 'Trigger function to update leaderboard when user stats change';
COMMENT ON FUNCTION public.get_time_until_next_daily_points(UUID) IS 'Returns the time remaining until a user can claim daily points again';
COMMENT ON FUNCTION public.claim_daily_points(UUID, INTEGER) IS 'Claims daily points for a user if 24 hours have passed since last claim';

-- 11. Create a function to get leaderboard position
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(user_id UUID)
RETURNS TABLE (position BIGINT, total_users BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      id,
      RANK() OVER (ORDER BY points DESC) as rank,
      COUNT(*) OVER () as total
    FROM public.users
    WHERE status = 'active'
  )
  SELECT rank::BIGINT, total::BIGINT
  FROM ranked_users
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 12. Enable RLS on tables if not already enabled
DO $$
BEGIN
    -- Enable RLS on users table
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
    
    -- Enable RLS on leaderboard table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        EXECUTE 'ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error enabling RLS: %', SQLERRM;
END $$;

-- 13. Create a function to get user's current daily points status
CREATE OR REPLACE FUNCTION public.get_daily_points_status(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
  time_until_next INTERVAL;
  can_claim BOOLEAN;
  next_claim_time TIMESTAMPTZ;
  last_claim_time TIMESTAMPTZ;
BEGIN
  -- Get user's last claim time and points
  SELECT 
    last_daily_points_at,
    points,
    level
  INTO user_data
  FROM public.users
  WHERE id = user_id;
  
  -- If no user found, return error
  IF user_data IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found',
      'can_claim', false
    );
  END IF;
  
  -- Calculate next claim time
  last_claim_time := user_data->>'last_daily_points_at';
  
  IF last_claim_time IS NULL THEN
    can_claim := true;
    time_until_next := INTERVAL '0 seconds';
    next_claim_time := NOW();
  ELSE
    next_claim_time := (last_claim_time::TIMESTAMPTZ + INTERVAL '24 hours');
    time_until_next := next_claim_time - NOW();
    can_claim := time_until_next <= INTERVAL '0 seconds';
  END IF;
  
  -- Return the status
  RETURN jsonb_build_object(
    'success', true,
    'can_claim', can_claim,
    'last_claim', last_claim_time,
    'next_claim', next_claim_time,
    'time_until_next', time_until_next::text,
    'current_points', user_data->'points',
    'current_level', user_data->'level'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
