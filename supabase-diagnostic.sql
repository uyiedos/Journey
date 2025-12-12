-- Diagnostic Script - Check What's Already in Your Database
-- Run this first to see what tables and columns exist

-- List all tables in the database
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if friendships table already exists and show its structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'friendships' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing RLS policies on friendships table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'friendships';

-- Check for any existing triggers on friendships table
SELECT trigger_name, event_manipulation, event_object_table, action_timing, action_condition, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'friendships'
ORDER BY trigger_name;
