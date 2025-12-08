-- Cleanup script to remove all mock data and prepare for fresh start
-- Run this in Supabase SQL Editor to clean up existing data

-- Clear all existing data (only if tables exist)
DO $$
BEGIN
    -- Clear daily_logins if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_logins') THEN
        DELETE FROM daily_logins;
        RAISE NOTICE 'Cleared daily_logins table';
    END IF;
    
    -- Clear devotionals if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'devotionals') THEN
        DELETE FROM devotionals;
        RAISE NOTICE 'Cleared devotionals table';
    END IF;
    
    -- Clear reading_plans if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reading_plans') THEN
        DELETE FROM reading_plans;
        RAISE NOTICE 'Cleared reading_plans table';
    END IF;
    
    -- Clear user_reading_plans if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_reading_plans') THEN
        DELETE FROM user_reading_plans;
        RAISE NOTICE 'Cleared user_reading_plans table';
    END IF;
    
    -- Clear reading_plan_progress if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reading_plan_progress') THEN
        DELETE FROM reading_plan_progress;
        RAISE NOTICE 'Cleared reading_plan_progress table';
    END IF;
    
    -- Clear points_transactions if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'points_transactions') THEN
        DELETE FROM points_transactions;
        RAISE NOTICE 'Cleared points_transactions table';
    END IF;
    
    -- Clear user_achievements if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        DELETE FROM user_achievements;
        RAISE NOTICE 'Cleared user_achievements table';
    END IF;
    
    -- Clear referrals if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'referrals') THEN
        DELETE FROM referrals;
        RAISE NOTICE 'Cleared referrals table';
    END IF;
    
    -- Clear user_messages if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_messages') THEN
        DELETE FROM user_messages;
        RAISE NOTICE 'Cleared user_messages table';
    END IF;
    
    -- Clear admin_notifications if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_notifications') THEN
        DELETE FROM admin_notifications;
        RAISE NOTICE 'Cleared admin_notifications table';
    END IF;
    
    -- Clear daily_login_rewards if exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_login_rewards') THEN
        DELETE FROM daily_login_rewards;
        RAISE NOTICE 'Cleared daily_login_rewards table';
    END IF;
END $$;

-- Reset user stats to 0 for all users (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
        -- Only update columns that exist
        UPDATE user_stats SET 
            verses_read = 0,
            chapters_completed = 0,
            devotionals_created = 0,
            prayers_shared = 0,
            friends_count = 0,
            reading_time_minutes = 0,
            last_activity_at = NOW();
        
        -- Update total_points_earned if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'total_points_earned') THEN
            UPDATE user_stats SET total_points_earned = 0;
        END IF;
        
        -- Update referrals_completed if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'referrals_completed') THEN
            UPDATE user_stats SET referrals_completed = 0;
        END IF;
        
        -- Update daily_challenges_completed if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'daily_challenges_completed') THEN
            UPDATE user_stats SET daily_challenges_completed = 0;
        END IF;
        
        RAISE NOTICE 'Reset user_stats table';
    END IF;
END $$;

-- Reset user points and streak for fresh start (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Only update columns that exist
        UPDATE users SET 
            points = 0,
            level = 1,
            streak = 0,
            last_login_date = NULL;
        
        -- Update longest_streak if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
            UPDATE users SET longest_streak = 0;
        END IF;
        
        -- Update daily_login_streak if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_login_streak') THEN
            UPDATE users SET daily_login_streak = 0;
        END IF;
        
        RAISE NOTICE 'Reset users table';
    END IF;
END $$;
