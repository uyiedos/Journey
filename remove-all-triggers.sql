-- Remove all triggers that might be causing the daily points claim error

-- Drop all triggers on users table
DROP TRIGGER IF EXISTS on_user_points_change ON public.users;
DROP TRIGGER IF EXISTS on_user_update ON public.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Drop all trigger functions
DROP FUNCTION IF EXISTS public.update_leaderboard_trigger();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate only the basic update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger only to user_stats table
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Make sure users table has updated_at column with proper default
ALTER TABLE public.users 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Check if last_daily_claim column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_daily_claim'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_daily_claim TIMESTAMPTZ;
    END IF;
END $$;
