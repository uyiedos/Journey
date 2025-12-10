-- Debug points issue - Comprehensive check and fix
-- Run in Supabase SQL Editor

-- 1. Check if users table exists and has correct columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if user_stats table exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'user_stats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if daily_login_rewards table exists
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'daily_login_rewards' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check RLS status on users table
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 5. Check RLS policies on users table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 6. Test direct update with your user ID
-- Replace 'YOUR_USER_ID' with the actual user ID from the console logs
DO $$
DECLARE
    user_id UUID := '58d80402-ffd8-433a-8009-55acd57c0f70';
    update_result TEXT;
BEGIN
    -- Try a simple update
    UPDATE public.users 
    SET points = COALESCE(points, 0) + 10,
        updated_at = NOW()
    WHERE id = user_id;
    
    GET DIAGNOSTICS update_result = ROW_COUNT;
    
    RAISE NOTICE 'Update completed. Rows affected: %', update_result;
    
    -- Check the updated values
    RAISE NOTICE 'Current user data:';
    RAISE NOTICE 'Points: %', (SELECT points FROM public.users WHERE id = user_id);
    RAISE NOTICE 'Level: %', (SELECT level FROM public.users WHERE id = user_id);
    RAISE NOTICE 'Streak: %', (SELECT streak FROM public.users WHERE id = user_id);
    RAISE NOTICE 'Updated at: %', (SELECT updated_at FROM public.users WHERE id = user_id);
END $$;

-- 7. Check if there are any triggers on the users table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'public';
