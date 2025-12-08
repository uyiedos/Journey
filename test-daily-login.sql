-- Test script for daily login functionality
-- Run this to verify the daily_logins table and related functions work correctly

-- Test 1: Check if daily_logins table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_logins' 
ORDER BY ordinal_position;

-- Test 2: Check RLS policies for daily_logins
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'daily_logins';

-- Test 3: Test inserting a daily login record (replace with actual user UUID)
-- INSERT INTO daily_logins (user_id, login_date, points_awarded)
-- VALUES ('your-user-uuid-here', CURRENT_DATE, 10)
-- ON CONFLICT (user_id, login_date) DO NOTHING;

-- Test 4: Query daily logins for a user (replace with actual user UUID)
-- SELECT * FROM daily_logins 
-- WHERE user_id = 'your-user-uuid-here' 
-- ORDER BY login_date DESC 
-- LIMIT 7;

-- Test 5: Check if indexes exist
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'daily_logins';

-- Test 6: Verify real-time is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'daily_logins';
