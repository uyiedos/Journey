-- Debug script to check points issue
-- Run these queries one by one in Supabase SQL Editor

-- 1. Check if the daily_login_rewards entry was created
SELECT * FROM public.daily_login_rewards ORDER BY created_at DESC LIMIT 5;

-- 2. Check current user points
SELECT id, points, level, streak, last_daily_claim, updated_at 
FROM public.users 
ORDER BY updated_at DESC LIMIT 5;

-- 3. Check if the RPC function exists and works
SELECT proname FROM pg_proc WHERE proname = 'claim_daily_points_rpc';

-- 4. Test the RPC function manually (replace YOUR_USER_ID)
-- SELECT claim_daily_points_rpc(
--   'YOUR_USER_ID_HERE',
--   10,
--   10,
--   1,
--   0,
--   NOW()
-- );

-- 5. Check RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Check if user_stats table has points
SELECT * FROM public.user_stats ORDER BY updated_at DESC LIMIT 5;
