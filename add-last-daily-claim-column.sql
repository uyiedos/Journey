-- Add last_daily_claim column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMPTZ;
