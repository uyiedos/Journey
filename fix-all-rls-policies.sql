-- Fix all RLS policies for users, leaderboard, and daily_login_rewards tables
-- Run this in Supabase SQL Editor

-- 1. Fix users table RLS policies
DO $$
BEGIN
    -- Enable RLS on users table
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    
    -- Create new policies
    CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Allow public read access for leaderboard view
    CREATE POLICY "Users can view all profiles for leaderboard" ON public.users
    FOR SELECT USING (true);
    
    RAISE NOTICE 'Users table RLS policies updated';
END $$;

-- 2. Fix leaderboard table RLS policies
DO $$
BEGIN
    -- Check if leaderboard table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        
        -- Enable RLS
        ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view leaderboard" ON public.leaderboard;
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.leaderboard;
        
        -- Create public read policy
        CREATE POLICY "Users can view leaderboard" ON public.leaderboard
        FOR SELECT USING (true);
        
        -- Create insert/update policies for system
        CREATE POLICY "System can insert leaderboard data" ON public.leaderboard
        FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "System can update leaderboard data" ON public.leaderboard
        FOR UPDATE USING (true);
        
        RAISE NOTICE 'Leaderboard table RLS policies updated';
    ELSE
        RAISE NOTICE 'Leaderboard table does not exist, skipping';
    END IF;
END $$;

-- 3. Fix daily_login_rewards table RLS policies
DO $$
BEGIN
    -- Check if daily_login_rewards table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'daily_login_rewards') THEN
        
        -- Enable RLS
        ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own daily rewards" ON public.daily_login_rewards;
        DROP POLICY IF EXISTS "Users can insert own daily rewards" ON public.daily_login_rewards;
        
        -- Create policies
        CREATE POLICY "Users can view own daily rewards" ON public.daily_login_rewards
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own daily rewards" ON public.daily_login_rewards
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'Daily login rewards table RLS policies updated';
    ELSE
        RAISE NOTICE 'Daily login rewards table does not exist, creating it';
        
        -- Create the table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.daily_login_rewards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            reward_date DATE NOT NULL,
            points_awarded INTEGER NOT NULL DEFAULT 5,
            streak_day INTEGER NOT NULL DEFAULT 1,
            claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, reward_date)
        );
        
        -- Enable RLS
        ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view own daily rewards" ON public.daily_login_rewards
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own daily rewards" ON public.daily_login_rewards
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'Daily login rewards table created and RLS policies applied';
    END IF;
END $$;

-- 4. Fix user_stats table RLS policies
DO $$
BEGIN
    -- Check if user_stats table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'user_stats') THEN
        
        -- Enable RLS
        ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
        DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
        
        -- Create policies
        CREATE POLICY "Users can view own stats" ON public.user_stats
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own stats" ON public.user_stats
        FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own stats" ON public.user_stats
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'User stats table RLS policies updated';
    END IF;
END $$;

-- 5. Create or update the leaderboard trigger function
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if leaderboard table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'leaderboard') THEN
        
        -- Update or insert into leaderboard
        INSERT INTO public.leaderboard (user_id, points, level, streak, last_updated)
        VALUES (NEW.id, NEW.points, NEW.level, NEW.streak, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            points = EXCLUDED.points,
            level = EXCLUDED.level,
            streak = EXCLUDED.streak,
            last_updated = NOW();
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the user update if leaderboard update fails
    RAISE NOTICE 'Leaderboard update failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for user updates
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS on_user_updated ON public.users;
    
    -- Create the trigger
    CREATE TRIGGER on_user_updated
    AFTER UPDATE OF points, level, streak ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leaderboard();
    
    RAISE NOTICE 'User update trigger created';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;

-- 7. Grant necessary permissions
DO $$
BEGIN
    -- Grant usage on schema
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO anon;
    
    -- Grant permissions on tables
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
    
    RAISE NOTICE 'Table permissions granted';
END $$;

-- 8. Verify policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'leaderboard', 'daily_login_rewards', 'user_stats')
ORDER BY tablename, policyname;
