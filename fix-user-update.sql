-- Fix user update issues by disabling problematic triggers

-- Disable the leaderboard trigger temporarily
DROP TRIGGER IF EXISTS on_user_points_change ON public.users;

-- Check if user_stats table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_points_earned INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Re-enable the trigger with a simpler function
CREATE OR REPLACE FUNCTION public.update_leaderboard_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple trigger that does nothing for now
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_user_points_change
AFTER UPDATE ON public.users
FOR EACH ROW
WHEN (OLD.points IS DISTINCT FROM NEW.points OR OLD.streak IS DISTINCT FROM NEW.streak)
EXECUTE FUNCTION public.update_leaderboard_trigger();
