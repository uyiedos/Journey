-- Test script to verify the points system is working
-- Run this in Supabase SQL Editor after applying the fix-gamified-points-system.sql script

-- First, let's check if all tables exist and have data
DO $$
BEGIN
    RAISE NOTICE '=== TESTING POINTS SYSTEM ===';
    
    -- Check users table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE '✓ Users table exists with % rows', (SELECT COUNT(*) FROM users);
        
        -- Check if users have points column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
            RAISE NOTICE '✓ Points column exists in users table';
        ELSE
            RAISE NOTICE '✗ Points column missing in users table';
        END IF;
        
        -- Check if users have level column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
            RAISE NOTICE '✓ Level column exists in users table';
        ELSE
            RAISE NOTICE '✗ Level column missing in users table';
        END IF;
    ELSE
        RAISE NOTICE '✗ Users table does not exist';
    END IF;
    
    -- Check user_stats table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stats') THEN
        RAISE NOTICE '✓ User stats table exists with % rows', (SELECT COUNT(*) FROM user_stats);
    ELSE
        RAISE NOTICE '✗ User stats table does not exist';
    END IF;
    
    -- Check daily_login_rewards table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_login_rewards') THEN
        RAISE NOTICE '✓ Daily login rewards table exists with % rows', (SELECT COUNT(*) FROM daily_login_rewards);
    ELSE
        RAISE NOTICE '✗ Daily login rewards table does not exist';
    END IF;
    
    -- Check achievements table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'achievements') THEN
        RAISE NOTICE '✓ Achievements table exists with % rows', (SELECT COUNT(*) FROM achievements);
    ELSE
        RAISE NOTICE '✗ Achievements table does not exist';
    END IF;
    
    -- Check user_achievements table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        RAISE NOTICE '✓ User achievements table exists with % rows', (SELECT COUNT(*) FROM user_achievements);
    ELSE
        RAISE NOTICE '✗ User achievements table does not exist';
    END IF;
    
    -- Check points_transactions table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'points_transactions') THEN
        RAISE NOTICE '✓ Points transactions table exists with % rows', (SELECT COUNT(*) FROM points_transactions);
    ELSE
        RAISE NOTICE '✗ Points transactions table does not exist';
    END IF;
    
    RAISE NOTICE '=== TABLE VERIFICATION COMPLETE ===';
END $$;

-- Test the add_user_points function
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    RAISE NOTICE '=== TESTING ADD POINTS FUNCTION ===';
    
    -- Test adding points to a user (if any users exist)
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        -- Get a test user
        DECLARE test_user_id UUID;
        BEGIN
            SELECT id INTO test_user_id FROM users LIMIT 1;
            
            -- Add test points
            SELECT add_user_points(test_user_id, 10, 'test', 'Test points addition') INTO test_result;
            
            IF test_result THEN
                RAISE NOTICE '✓ Successfully added test points to user %', test_user_id;
                
                -- Check if points were updated
                DECLARE current_points INTEGER;
                SELECT points INTO current_points FROM users WHERE id = test_user_id;
                RAISE NOTICE '✓ User now has % points', current_points;
                
                -- Check if transaction was logged
                DECLARE transaction_count INTEGER;
                SELECT COUNT(*) INTO transaction_count FROM points_transactions WHERE user_id = test_user_id AND transaction_type = 'test';
                IF transaction_count > 0 THEN
                    RAISE NOTICE '✓ Points transaction was logged correctly';
                ELSE
                    RAISE NOTICE '✗ Points transaction was not logged';
                END IF;
            ELSE
                RAISE NOTICE '✗ Failed to add test points';
            END IF;
        END;
    ELSE
        RAISE NOTICE '⚠ No users found to test with. Please create a user first.';
    END IF;
    
    RAISE NOTICE '=== POINTS FUNCTION TEST COMPLETE ===';
END $$;

-- Test level calculation
DO $$
BEGIN
    RAISE NOTICE '=== TESTING LEVEL CALCULATION ===';
    
    -- Test the calculate_level function
    RAISE NOTICE 'Level for 0 points: %', calculate_level(0);
    RAISE NOTICE 'Level for 50 points: %', calculate_level(50);
    RAISE NOTICE 'Level for 100 points: %', calculate_level(100);
    RAISE NOTICE 'Level for 250 points: %', calculate_level(250);
    RAISE NOTICE 'Level for 500 points: %', calculate_level(500);
    RAISE NOTICE 'Level for 1000 points: %', calculate_level(1000);
    
    RAISE NOTICE '=== LEVEL CALCULATION TEST COMPLETE ===';
END $$;

-- Show current state of the system
SELECT 
    'Users' as table_name,
    COUNT(*) as row_count,
    STRING_AGG(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'users' 
GROUP BY table_name

UNION ALL

SELECT 
    'User Stats' as table_name,
    (SELECT COUNT(*) FROM user_stats)::text as row_count,
    STRING_AGG(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
GROUP BY table_name

UNION ALL

SELECT 
    'Daily Login Rewards' as table_name,
    (SELECT COUNT(*) FROM daily_login_rewards)::text as row_count,
    STRING_AGG(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'daily_login_rewards' 
GROUP BY table_name;

-- Show sample data if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        RAISE NOTICE '=== SAMPLE USER DATA ===';
        FOR user_record IN 
            SELECT id, email, points, level, streak, created_at 
            FROM users 
            LIMIT 3
        LOOP
            RAISE NOTICE 'User: % | Points: % | Level: % | Streak: % | Created: %', 
                user_record.email, 
                user_record.points, 
                user_record.level, 
                user_record.streak,
                user_record.created_at;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM points_transactions LIMIT 1) THEN
        RAISE NOTICE '=== RECENT POINTS TRANSACTIONS ===';
        FOR tx_record IN 
            SELECT user_id, transaction_type, points, description, created_at 
            FROM points_transactions 
            ORDER BY created_at DESC 
            LIMIT 5
        LOOP
            RAISE NOTICE 'Transaction: % | Points: % | Type: % | %', 
                tx_record.user_id, 
                tx_record.points, 
                tx_record.transaction_type,
                tx_record.description;
        END LOOP;
    END IF;
END $$;

-- Final notice
DO $$
BEGIN
    RAISE NOTICE '=== POINTS SYSTEM TEST COMPLETE ===';
    RAISE NOTICE 'If all tests passed, the points system should be working correctly.';
    RAISE NOTICE 'Make sure to run the fix-gamified-points-system.sql script first if you haven''t already.';
END $$;
