-- Fix points system - ensure all required columns exist in users table
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        
        -- Add points column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
            ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
            RAISE NOTICE 'Added points column to users table';
        END IF;
        
        -- Add level column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
            ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
            RAISE NOTICE 'Added level column to users table';
        END IF;
        
        -- Add streak column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak') THEN
            ALTER TABLE users ADD COLUMN streak INTEGER DEFAULT 0;
            RAISE NOTICE 'Added streak column to users table';
        END IF;
        
        -- Add longest_streak column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
            ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
            RAISE NOTICE 'Added longest_streak column to users table';
        END IF;
        
        -- Add referral_code column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
            ALTER TABLE users ADD COLUMN referral_code VARCHAR(10);
            RAISE NOTICE 'Added referral_code column to users table';
        END IF;
        
        -- Add referred_by column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
            ALTER TABLE users ADD COLUMN referred_by VARCHAR(10);
            RAISE NOTICE 'Added referred_by column to users table';
        END IF;
        
        -- Add is_active column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
            ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
            RAISE NOTICE 'Added is_active column to users table';
        END IF;
        
        -- Add last_login_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
            ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added last_login_at column to users table';
        END IF;
        
        -- Add daily_login_streak column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_login_streak') THEN
            ALTER TABLE users ADD COLUMN daily_login_streak INTEGER DEFAULT 0;
            RAISE NOTICE 'Added daily_login_streak column to users table';
        END IF;
        
        -- Add last_login_date column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_date') THEN
            ALTER TABLE users ADD COLUMN last_login_date DATE;
            RAISE NOTICE 'Added last_login_date column to users table';
        END IF;
        
        RAISE NOTICE 'Users table columns verified/updated';
    ELSE
        RAISE NOTICE 'Users table does not exist - run full migration first';
    END IF;
END $$;

-- Verify the users table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if user_stats table exists and has required columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
        RAISE NOTICE 'user_stats table exists';
        
        -- Add total_points_earned if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'total_points_earned') THEN
            ALTER TABLE user_stats ADD COLUMN total_points_earned INTEGER DEFAULT 0;
            RAISE NOTICE 'Added total_points_earned column to user_stats table';
        END IF;
        
        -- Add referrals_completed if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'referrals_completed') THEN
            ALTER TABLE user_stats ADD COLUMN referrals_completed INTEGER DEFAULT 0;
            RAISE NOTICE 'Added referrals_completed column to user_stats table';
        END IF;
        
        -- Add daily_challenges_completed if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'daily_challenges_completed') THEN
            ALTER TABLE user_stats ADD COLUMN daily_challenges_completed INTEGER DEFAULT 0;
            RAISE NOTICE 'Added daily_challenges_completed column to user_stats table';
        END IF;
        
        -- Add last_activity_at if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'last_activity_at') THEN
            ALTER TABLE user_stats ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added last_activity_at column to user_stats table';
        END IF;
    ELSE
        RAISE NOTICE 'user_stats table does not exist';
    END IF;
END $$;
