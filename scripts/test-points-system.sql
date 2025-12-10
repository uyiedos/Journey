-- Test script to verify points system
-- Run these queries in Supabase SQL Editor

-- 1. Check if users table has the correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('points', 'level', 'streak', 'longest_streak', 'last_daily_claim')
ORDER BY column_name;

-- 2. Check if daily_login_rewards table exists and has the correct columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_login_rewards' 
ORDER BY column_name;

-- 3. Check current user data (replace YOUR_USER_ID)
SELECT id, points, level, streak, longest_streak, last_daily_claim, updated_at 
FROM public.users 
ORDER BY updated_at DESC 
LIMIT 5;

-- 4. Check recent daily rewards
SELECT user_id, reward_date, points_awarded, streak_day, created_at 
FROM public.daily_login_rewards 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Test manual points update (replace YOUR_USER_ID)
-- UPDATE public.users 
-- SET points = COALESCE(points, 0) + 10,
--     level = FLOOR(COALESCE(points, 0) + 10 / 100) + 1,
--     updated_at = NOW()
-- WHERE id = 'YOUR_USER_ID'
-- RETURNING *;

-- 6. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'daily_login_rewards', 'user_stats');
