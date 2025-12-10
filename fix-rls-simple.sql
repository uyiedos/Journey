-- Simple RLS fix - Drop and recreate only necessary policies
-- Run this in Supabase SQL Editor

-- 1. Fix users table - Drop all existing policies first
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can view all profiles for leaderboard" ON public.users;
    
    -- Create new policies
    CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Public read for leaderboard
    CREATE POLICY "Public read access for leaderboard" ON public.users
    FOR SELECT USING (true);
    
    RAISE NOTICE 'Users table policies fixed';
END $$;

-- 2. Fix leaderboard table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        
        -- Enable RLS
        ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
        
        -- Drop all existing policies
        DROP POLICY IF EXISTS "Users can view leaderboard" ON public.leaderboard;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.leaderboard;
        DROP POLICY IF EXISTS "System can insert leaderboard data" ON public.leaderboard;
        DROP POLICY IF EXISTS "System can update leaderboard data" ON public.leaderboard;
        
        -- Create policies
        CREATE POLICY "Public read access" ON public.leaderboard
        FOR SELECT USING (true);
        
        CREATE POLICY "Service role can modify" ON public.leaderboard
        FOR ALL USING (pg_has_role('service_role', 'member'));
        
        RAISE NOTICE 'Leaderboard table policies fixed';
    END IF;
END $$;

-- 3. Fix daily_login_rewards table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'daily_login_rewards') THEN
        
        -- Enable RLS
        ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;
        
        -- Drop all existing policies
        DROP POLICY IF EXISTS "Users can view own daily rewards" ON public.daily_login_rewards;
        DROP POLICY IF EXISTS "Users can insert own daily rewards" ON public.daily_login_rewards;
        
        -- Create policies
        CREATE POLICY "Users can view own daily rewards" ON public.daily_login_rewards
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own daily rewards" ON public.daily_login_rewards
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'Daily login rewards table policies fixed';
    END IF;
END $$;

-- 4. Fix user_stats table - Handle existing policies properly
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'user_stats') THEN
        
        -- Enable RLS
        ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
        
        -- Drop all existing policies safely
        DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
        DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
        DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_stats;
        
        -- Create policies
        CREATE POLICY "Users can view own stats" ON public.user_stats
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own stats" ON public.user_stats
        FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own stats" ON public.user_stats
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'User stats table policies fixed';
    END IF;
END $$;

-- 5. Grant permissions
DO $$
BEGIN
    -- Grant schema permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;
    
    -- Grant table permissions
    GRANT ALL ON public.users TO authenticated;
    GRANT SELECT ON public.users TO anon;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        GRANT ALL ON public.leaderboard TO authenticated;
        GRANT SELECT ON public.leaderboard TO anon;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'daily_login_rewards') THEN
        GRANT ALL ON public.daily_login_rewards TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'user_stats') THEN
        GRANT ALL ON public.user_stats TO authenticated;
    END IF;
    
    RAISE NOTICE 'All permissions granted';
END $$;
