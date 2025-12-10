-- Test direct points update
-- Replace YOUR_USER_ID with your actual user ID

-- 1. Check current user data
SELECT id, points, level, streak, longest_streak, last_daily_claim, updated_at 
FROM public.users 
WHERE id = 'YOUR_USER_ID';

-- 2. Test manual points update
UPDATE public.users 
SET points = COALESCE(points, 0) + 10,
    level = FLOOR((COALESCE(points, 0) + 10) / 100) + 1,
    updated_at = NOW()
WHERE id = 'YOUR_USER_ID'
RETURNING *;

-- 3. Check if the update worked
SELECT id, points, level, streak, longest_streak, last_daily_claim, updated_at 
FROM public.users 
WHERE id = 'YOUR_USER_ID';
