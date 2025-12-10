-- Comprehensive fix for the gamified points system
-- This script ensures all tables and columns exist for the points system to work properly
-- Run this in Supabase SQL Editor

-- First, let's check and create all necessary tables
DO $$
BEGIN
    RAISE NOTICE 'Starting comprehensive points system fix...';
    
    -- Check and create users table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            username VARCHAR(50) UNIQUE,
            avatar_url TEXT,
            points INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
            referral_code VARCHAR(10) UNIQUE,
            referred_by UUID REFERENCES users(id),
            is_active BOOLEAN DEFAULT true,
            last_login_at TIMESTAMP WITH TIME ZONE,
            daily_login_streak INTEGER DEFAULT 0,
            last_login_date DATE,
            notification_preferences JSONB DEFAULT '{"email": true, "push": true, "admin_messages": true, "daily_reminders": true}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created users table';
    END IF;
    
    -- Check and add missing columns to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
        RAISE NOTICE 'Added points column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
        RAISE NOTICE 'Added level column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak') THEN
        ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Added streak column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
        ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Added longest_streak column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to users table';
    END IF;
    
    -- Create user_stats table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
        CREATE TABLE user_stats (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
            verses_read INTEGER DEFAULT 0,
            chapters_completed INTEGER DEFAULT 0,
            devotionals_created INTEGER DEFAULT 0,
            prayers_shared INTEGER DEFAULT 0,
            friends_count INTEGER DEFAULT 0,
            reading_time_minutes INTEGER DEFAULT 0,
            community_posts INTEGER DEFAULT 0,
            reading_plans_started INTEGER DEFAULT 0,
            reading_plans_completed INTEGER DEFAULT 0,
            total_points_earned INTEGER DEFAULT 0,
            referrals_completed INTEGER DEFAULT 0,
            daily_challenges_completed INTEGER DEFAULT 0,
            last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created user_stats table';
    END IF;
    
    -- Create daily_login_rewards table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_login_rewards') THEN
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
        RAISE NOTICE 'Created daily_login_rewards table';
    END IF;
    
    -- Create user_achievements table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        CREATE TABLE user_achievements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            achievement_id VARCHAR(100) NOT NULL,
            unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            points_awarded INTEGER DEFAULT 0,
            UNIQUE(user_id, achievement_id)
        );
        RAISE NOTICE 'Created user_achievements table';
    END IF;
    
    -- Create achievements table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievements') THEN
        CREATE TABLE achievements (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            points INTEGER NOT NULL DEFAULT 0,
            icon VARCHAR(50),
            requirement JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created achievements table';
    END IF;
    
    -- Create points_transactions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'points_transactions') THEN
        CREATE TABLE points_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('daily_login', 'referral', 'reading', 'devotional', 'prayer', 'community', 'achievement', 'admin_bonus')),
            points INTEGER NOT NULL,
            description TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created points_transactions table';
    END IF;
    
    RAISE NOTICE 'All tables verified/created successfully';
END $$;

-- Enable RLS on all tables
DO $$
BEGIN
    -- Users table
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- User stats table
    ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
    DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
    CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Daily login rewards table
    ALTER TABLE daily_login_rewards ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own rewards" ON daily_login_rewards;
    DROP POLICY IF EXISTS "Users can insert own rewards" ON daily_login_rewards;
    CREATE POLICY "Users can view own rewards" ON daily_login_rewards FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own rewards" ON daily_login_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- User achievements table
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
    DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
    CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Points transactions table
    ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own transactions" ON points_transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON points_transactions;
    CREATE POLICY "Users can view own transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Achievements table (read-only for users)
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
    CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
    
    RAISE NOTICE 'RLS policies enabled for all tables';
END $$;

-- Create indexes for performance
DO $$
BEGIN
    -- Users table indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
    
    -- User stats indexes
    CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
    
    -- Daily login rewards indexes
    CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_user_id ON daily_login_rewards(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_login_date ON daily_login_rewards(login_date);
    
    -- User achievements indexes
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
    
    -- Points transactions indexes
    CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
    
    RAISE NOTICE 'Indexes created for performance';
END $$;

-- Insert basic achievement data if achievements table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM achievements) = 0 THEN
        INSERT INTO achievements (id, title, description, category, points, icon, requirement) VALUES
        ('daily-login-1', 'First Day', 'Log in for the first day', 'daily', 5, 'calendar', {'days': 1}),
        ('daily-login-7', 'Week Warrior', 'Log in for 7 consecutive days', 'daily', 50, 'flame', {'days': 7}),
        ('daily-login-30', 'Monthly Master', 'Log in for 30 consecutive days', 'daily', 200, 'trophy', {'days': 30}),
        ('points-100', 'Century Club', 'Earn 100 total points', 'points', 25, 'star', {'points': 100}),
        ('points-500', 'Points Powerhouse', 'Earn 500 total points', 'points', 100, 'zap', {'points': 500}),
        ('points-1000', 'Points Legend', 'Earn 1000 total points', 'points', 250, 'crown', {'points': 1000});
        RAISE NOTICE 'Inserted basic achievement data';
    END IF;
END $$;

-- Create function to calculate level from points
CREATE OR REPLACE FUNCTION calculate_level(points INTEGER) RETURNS INTEGER AS $$
BEGIN
    -- Level formula: every 100 points = 1 level
    RETURN GREATEST(1, FLOOR(points / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update level when points change
CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
BEGIN
    NEW.level = calculate_level(NEW.points);
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_user_level ON users;
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF points ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Create function to add points with transaction logging
CREATE OR REPLACE FUNCTION add_user_points(
    user_id UUID,
    points INTEGER,
    transaction_type VARCHAR(50),
    description TEXT DEFAULT NULL,
    metadata JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_points INTEGER;
BEGIN
    -- Get current points
    SELECT COALESCE(points, 0) INTO current_points FROM users WHERE id = add_user_points.user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Update user points
    UPDATE users 
    SET points = current_points + points,
        updated_at = NOW()
    WHERE id = add_user_points.user_id;
    
    -- Log transaction
    INSERT INTO points_transactions (user_id, transaction_type, points, description, metadata)
    VALUES (user_id, transaction_type, points, description, metadata);
    
    -- Update user stats if table exists
    UPDATE user_stats 
    SET total_points_earned = COALESCE(total_points_earned, 0) + points,
        last_activity_at = NOW()
    WHERE user_id = add_user_points.user_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding points: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Verify everything is working
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Users table: % rows', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'User stats table: % rows', (SELECT COUNT(*) FROM user_stats);
    RAISE NOTICE 'Daily login rewards table: % rows', (SELECT COUNT(*) FROM daily_login_rewards);
    RAISE NOTICE 'User achievements table: % rows', (SELECT COUNT(*) FROM user_achievements);
    RAISE NOTICE 'Achievements table: % rows', (SELECT COUNT(*) FROM achievements);
    RAISE NOTICE 'Points transactions table: % rows', (SELECT COUNT(*) FROM points_transactions);
    RAISE NOTICE '=== FIX COMPLETED SUCCESSFULLY ===';
END $$;
