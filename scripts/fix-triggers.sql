-- Fix problematic triggers
-- Run in Supabase SQL Editor

-- 1. Check all triggers on users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'public';

-- 2. Drop the problematic trigger
DROP TRIGGER IF EXISTS updateaderboard_entry_trigger ON public.users;
DROP FUNCTION IF EXISTS update_leaderboard_entry() CASCADE;

-- 3. Check if there are any other problematic triggers
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%update%'
AND routine_schema = 'public'
AND routine_type = 'FUNCTION';

-- 4. Test the update again
DO $$
DECLARE
    user_id UUID := '58d80402-ffd8-433a-8009-55acd57c0f70';
    update_result TEXT;
BEGIN
    -- Try the update
    UPDATE public.users 
    SET points = COALESCE(points, 0) + 10,
        updated_at = NOW()
    WHERE id = user_id;
    
    GET DIAGNOSTICS update_result = ROW_COUNT;
    
    RAISE NOTICE 'Update completed successfully. Rows affected: %', update_result;
    
    -- Check the updated values
    RAISE NOTICE 'Current user data:';
    RAISE NOTICE 'Points: %', (SELECT points FROM public.users WHERE id = user_id);
    RAISE NOTICE 'Level: %', (SELECT level FROM public.users WHERE id = user_id);
    RAISE NOTICE 'Updated at: %', (SELECT updated_at FROM public.users WHERE id = user_id);
END $$;
