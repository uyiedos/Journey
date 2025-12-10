-- Fix daily points claim by disabling problematic triggers

-- Drop the problematic trigger that's causing the error
DROP TRIGGER IF EXISTS on_user_points_change ON public.users;

-- Drop the trigger function as well
DROP FUNCTION IF EXISTS public.update_leaderboard_trigger();

-- Check if user_stats table exists, if not create it
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_points_earned INTEGER DEFAULT 0,
  verses_read INTEGER DEFAULT 0,
  chapters_completed INTEGER DEFAULT 0,
  prayers_shared INTEGER DEFAULT 0,
  reading_time_minutes INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create trigger for user_stats table
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verify the updated_at column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
