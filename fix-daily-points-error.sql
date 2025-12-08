-- Fix daily points claim error
-- This script checks and fixes common issues with the daily points system

-- Check if users table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Users table does not exist. Please run the main migration script first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Users table exists.';
END $$;

-- Check if daily_login_rewards table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_login_rewards') THEN
        RAISE NOTICE 'daily_login_rewards table does not exist. Creating it...';
        
        CREATE TABLE daily_login_rewards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            login_date DATE NOT NULL,
            points_awarded INTEGER NOT NULL DEFAULT 10,
            streak_multiplier INTEGER DEFAULT 1,
            bonus_points INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, login_date)
        );
        
        -- Create indexes
        CREATE INDEX idx_daily_login_rewards_user_id ON daily_login_rewards(user_id);
        CREATE INDEX idx_daily_login_rewards_login_date ON daily_login_rewards(login_date);
        
        -- Enable RLS
        ALTER TABLE daily_login_rewards ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Users can view own rewards" ON daily_login_rewards;
        CREATE POLICY "Users can view own rewards" ON daily_login_rewards FOR SELECT USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "Users can insert own rewards" ON daily_login_rewards;
        CREATE POLICY "Users can insert own rewards" ON daily_login_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        RAISE NOTICE 'daily_login_rewards table created successfully.';
    ELSE
        RAISE NOTICE 'daily_login_rewards table exists.';
    END IF;
END $$;

-- Check if users table has the required columns
DO $$
BEGIN
    -- Check for points column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
        RAISE NOTICE 'Added points column to users table.';
    END IF;
    
    -- Check for level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
        RAISE NOTICE 'Added level column to users table.';
    END IF;
    
    -- Check for updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to users table.';
    END IF;
    
    RAISE NOTICE 'Users table columns verified.';
END $$;

-- Check RLS policies for users table
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    
    -- Create policies
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    
    RAISE NOTICE 'Users table RLS policies updated.';
END $$;

-- Check if the user has a profile
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'No users found in the users table. You may need to create a user profile first.';
    ELSE
        RAISE NOTICE 'Found % user(s) in the users table.', user_count;
    END IF;
END $$;

-- Test query to verify everything works
SELECT 'Testing daily_login_rewards table access...' as status;
SELECT COUNT(*) as total_rewards FROM daily_login_rewards LIMIT 1;
SELECT 'Testing users table access...' as status;
SELECT COUNT(*) as total_users FROM users LIMIT 1;

-- Final notice
DO $$
BEGIN
    RAISE NOTICE 'Database fix completed. Try the daily points claim again.';
END $$;
