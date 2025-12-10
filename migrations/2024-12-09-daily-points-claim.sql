-- Add last_daily_claim column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;

-- Create index on last_daily_claim for faster queries
CREATE INDEX IF NOT EXISTS idx_users_last_daily_claim ON users(last_daily_claim);

-- Ensure user_stats table exists for tracking stats
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
