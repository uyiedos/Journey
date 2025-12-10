-- Migration: Complete Points System Setup
-- Date: 2024-12-08
-- Description: Creates all necessary tables, functions, and permissions for the gamified points system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create or update the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_daily_claim TIMESTAMPTZ,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add any missing columns to existing users table
DO $$
BEGIN
  -- Add points column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'points') THEN
    ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Add level column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'level') THEN
    ALTER TABLE public.users ADD COLUMN level INTEGER DEFAULT 1 NOT NULL;
  END IF;

  -- Add streak column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'streak') THEN
    ALTER TABLE public.users ADD COLUMN streak INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Add longest_streak column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
    ALTER TABLE public.users ADD COLUMN longest_streak INTEGER DEFAULT 0 NOT NULL;
  END IF;

  -- Add last_daily_claim column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'last_daily_claim') THEN
    ALTER TABLE public.users ADD COLUMN last_daily_claim TIMESTAMPTZ;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'status') THEN
    ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- 2. Create user_stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_points_earned INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- 3. Create daily_login_rewards table
CREATE TABLE IF NOT EXISTS public.daily_login_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create leaderboard view
DROP VIEW IF EXISTS public.leaderboard_view CASCADE;
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
  u.last_daily_claim,
  u.created_at,
  u.updated_at,
  RANK() OVER (ORDER BY u.points DESC, u.created_at ASC) as rank_position
FROM public.users u
WHERE u.status = 'active'
ORDER BY u.points DESC, u.created_at ASC;

-- 5. Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for user_stats table
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment points
CREATE OR REPLACE FUNCTION public.increment_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Update user's points and level
  UPDATE public.users
  SET 
    points = points + points_to_add,
    level = FLOOR((points + points_to_add) / 100) + 1,
    updated_at = NOW()
  WHERE id = user_id;

  -- Update or create user stats
  INSERT INTO public.user_stats (user_id, total_points_earned, last_activity_at)
  VALUES (user_id, points_to_add, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points_earned = public.user_stats.total_points_earned + EXCLUDED.total_points_earned,
    last_activity_at = EXCLUDED.last_activity_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim daily points
CREATE OR REPLACE FUNCTION public.claim_daily_points(user_id UUID)
RETURNS JSON AS $$
DECLARE
  last_claim TIMESTAMPTZ;
  hours_since_last_claim NUMERIC;
  points_awarded INTEGER := 5;
  bonus_points INTEGER := 0;
  current_streak INTEGER;
  result JSON;
BEGIN
  -- Get user's current streak
  SELECT streak INTO current_streak
  FROM public.users
  WHERE id = user_id;

  -- Calculate bonus points for streak milestones
  IF current_streak = 6 THEN bonus_points := 10; -- Will become streak 7
  ELSIF current_streak = 29 THEN bonus_points := 25; -- Will become streak 30
  ELSIF current_streak = 99 THEN bonus_points := 100; -- Will become streak 100
  END IF;

  points_awarded := points_awarded + bonus_points;

  -- Get last claim time
  SELECT MAX(created_at) INTO last_claim
  FROM public.daily_login_rewards
  WHERE user_id = user_id;

  -- If never claimed before, grant points
  IF last_claim IS NULL THEN
    PERFORM public.increment_points(user_id, points_awarded);
    
    INSERT INTO public.daily_login_rewards (user_id, points_awarded)
    VALUES (user_id, points_awarded);
    
    -- Update streak
    UPDATE public.users
    SET 
      streak = 1,
      longest_streak = GREATEST(longest_streak, 1),
      updated_at = NOW()
    WHERE id = user_id;
    
    RETURN json_build_object(
      'success', true,
      'points_awarded', points_awarded,
      'bonus_points', bonus_points,
      'new_streak', 1,
      'message', 'Daily points claimed successfully!'
    );
  END IF;

  -- Check if 24 hours have passed since last claim
  hours_since_last_claim := EXTRACT(EPOCH FROM (NOW() - last_claim)) / 3600;
  
  IF hours_since_last_claim >= 24 THEN
    -- Award points and update streak
    PERFORM public.increment_points(user_id, points_awarded);
    
    INSERT INTO public.daily_login_rewards (user_id, points_awarded)
    VALUES (user_id, points_awarded);
    
    -- Update streak
    UPDATE public.users
    SET 
      streak = CASE 
        WHEN hours_since_last_claim <= 48 THEN streak + 1
        ELSE 1
      END,
      longest_streak = CASE 
        WHEN hours_since_last_claim <= 48 THEN GREATEST(longest_streak, streak + 1)
        ELSE GREATEST(longest_streak, 1)
      END,
      updated_at = NOW()
    WHERE id = user_id;
    
    RETURN json_build_object(
      'success', true,
      'points_awarded', points_awarded,
      'bonus_points', bonus_points,
      'new_streak', CASE 
        WHEN hours_since_last_claim <= 48 THEN current_streak + 1
        ELSE 1
      END,
      'message', 'Daily points claimed successfully!'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'DAILY_LIMIT',
      'message', 'You have already claimed your daily points. Come back later!',
      'next_claim_in_hours', 24 - hours_since_last_claim
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's leaderboard position
DROP FUNCTION IF EXISTS public.get_user_leaderboard_position(UUID);
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_position(user_id UUID)
RETURNS TABLE(rank_position INTEGER, user_data JSON) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rank_position,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'full_name', u.full_name,
      'points', u.points,
      'level', u.level,
      'streak', u.streak
    )
  FROM (
    SELECT 
      u.*,
      RANK() OVER (ORDER BY u.points DESC, u.created_at ASC) as rank_position
    FROM public.users u
    WHERE u.status = 'active'
  ) u
  WHERE u.id = get_user_leaderboard_position.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time until next daily points claim
CREATE OR REPLACE FUNCTION public.get_time_until_next_daily_points(user_id UUID)
RETURNS JSON AS $$
DECLARE
  last_claim TIMESTAMPTZ;
  next_claim_time TIMESTAMPTZ;
  hours_remaining NUMERIC;
  minutes_remaining NUMERIC;
  seconds_remaining NUMERIC;
BEGIN
  -- Get last claim time
  SELECT MAX(created_at) INTO last_claim
  FROM public.daily_login_rewards
  WHERE user_id = user_id;

  -- If never claimed, user can claim now
  IF last_claim IS NULL THEN
    RETURN json_build_object(
      'can_claim', true,
      'message', 'You can claim your daily points now!'
    );
  END IF;

  -- Calculate next claim time (24 hours after last claim)
  next_claim_time := last_claim + INTERVAL '24 hours';
  
  -- Calculate time remaining
  IF NOW() >= next_claim_time THEN
    RETURN json_build_object(
      'can_claim', true,
      'message', 'You can claim your daily points now!'
    );
  ELSE
    hours_remaining := EXTRACT(EPOCH FROM (next_claim_time - NOW())) / 3600;
    minutes_remaining := (hours_remaining - FLOOR(hours_remaining)) * 60;
    seconds_remaining := (minutes_remaining - FLOOR(minutes_remaining)) * 60;
    
    RETURN json_build_object(
      'can_claim', false,
      'next_claim_time', next_claim_time,
      'hours_remaining', FLOOR(hours_remaining),
      'minutes_remaining', FLOOR(minutes_remaining),
      'seconds_remaining', FLOOR(seconds_remaining),
      'message', 'Daily points will be available soon!'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles for leaderboard" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;

DROP POLICY IF EXISTS "Users can view own rewards" ON public.daily_login_rewards;
DROP POLICY IF EXISTS "Users can insert own rewards" ON public.daily_login_rewards;

-- Create new RLS policies for users table
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles for leaderboard" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Create RLS policies for user_stats table
CREATE POLICY "Users can view own stats" 
  ON public.user_stats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" 
  ON public.user_stats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" 
  ON public.user_stats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for daily_login_rewards table
CREATE POLICY "Users can view own rewards" 
  ON public.daily_login_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" 
  ON public.daily_login_rewards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. Grant permissions

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

GRANT SELECT, INSERT, UPDATE ON public.user_stats TO authenticated;
GRANT SELECT ON public.user_stats TO anon;

GRANT SELECT, INSERT ON public.daily_login_rewards TO authenticated;
GRANT SELECT ON public.daily_login_rewards TO anon;

-- Grant permissions on views
GRANT SELECT ON public.leaderboard_view TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_points(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_position(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_time_until_next_daily_points(UUID) TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_streak ON public.users(streak DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_user_id ON public.daily_login_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_created_at ON public.daily_login_rewards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- 9. Create initial leaderboard trigger function
CREATE OR REPLACE FUNCTION public.update_leaderboard_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger can be used to update any derived tables or caches
  -- For now, we're using a view, so no action is needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leaderboard updates
DROP TRIGGER IF EXISTS on_user_points_change ON public.users;
CREATE TRIGGER on_user_points_change
AFTER UPDATE ON public.users
FOR EACH ROW
WHEN (OLD.points IS DISTINCT FROM NEW.points OR OLD.streak IS DISTINCT FROM NEW.streak)
EXECUTE FUNCTION public.update_leaderboard_trigger();

-- 10. Verify setup
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: users, user_stats, daily_login_rewards';
  RAISE NOTICE 'View created: leaderboard_view';
  RAISE NOTICE 'Functions created: increment_points, claim_daily_points, get_user_leaderboard_position, get_time_until_next_daily_points';
  RAISE NOTICE 'RLS policies created and enabled';
  RAISE NOTICE 'Permissions granted to authenticated and anon users';
  RAISE NOTICE 'Indexes created for performance';
END $$;
