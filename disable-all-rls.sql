-- Disable RLS completely for all tables
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on users table
DO $$
BEGIN
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS disabled on users table';
END $$;

-- 2. Disable RLS on leaderboard table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        ALTER TABLE public.leaderboard DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on leaderboard table';
    ELSE
        RAISE NOTICE 'Leaderboard table does not exist';
    END IF;
END $$;

-- 3. Disable RLS on daily_login_rewards table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'daily_login_rewards') THEN
        ALTER TABLE public.daily_login_rewards DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on daily_login_rewards table';
    ELSE
        RAISE NOTICE 'Daily login rewards table does not exist';
    END IF;
END $$;

-- 4. Disable RLS on user_stats table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'user_stats') THEN
        ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on user_stats table';
    ELSE
        RAISE NOTICE 'User stats table does not exist';
    END IF;
END $$;

-- 5. Disable RLS on likes table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'likes') THEN
        ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on likes table';
    ELSE
        RAISE NOTICE 'Likes table does not exist';
    END IF;
END $$;

-- 6. Disable RLS on points_transactions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'points_transactions') THEN
        ALTER TABLE public.points_transactions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on points_transactions table';
    ELSE
        RAISE NOTICE 'Points transactions table does not exist';
    END IF;
END $$;

-- 7. Grant full permissions to authenticated users
DO $$
BEGIN
    -- Grant schema permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;
    
    -- Grant full permissions on all tables to authenticated users
    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    
    -- Grant read permissions to anonymous users
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
    
    -- Grant usage on all sequences
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    
    RAISE NOTICE 'Full permissions granted to authenticated users';
END $$;

-- 8. Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'leaderboard', 'daily_login_rewards', 'user_stats', 'likes', 'points_transactions')
ORDER BY tablename;
