-- Debug script to check users table and add sample data if needed
-- Run this in Supabase SQL Editor

-- First, check the current structure and data in users table
SELECT 'users_table_structure' as info, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check current user count
SELECT 'users_count' as info, COUNT(*) as count FROM users;

-- Check active users with points
SELECT 'active_users_with_points' as info, id, email, username, points, level, streak, status, created_at
FROM users 
WHERE status = 'active' 
ORDER BY points DESC;

-- If there are no users or only 1 user, add some sample data
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    
    IF user_count <= 1 THEN
        -- Insert sample users for leaderboard testing
        INSERT INTO users (id, email, username, full_name, points, level, streak, longest_streak, status, created_at, updated_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'john@example.com', 'john_doe', 'John Doe', 2500, 3, 15, 20, 'active', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
        ('550e8400-e29b-41d4-a716-446655440002', 'jane@example.com', 'jane_smith', 'Jane Smith', 1800, 2, 8, 12, 'active', NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),
        ('550e8400-e29b-41d4-a716-446655440003', 'mike@example.com', 'mike_wilson', 'Mike Wilson', 3200, 4, 25, 30, 'active', NOW() - INTERVAL '45 days', NOW() - INTERVAL '3 hours'),
        ('550e8400-e29b-41d4-a716-446655440004', 'sarah@example.com', 'sarah_jones', 'Sarah Jones', 1500, 2, 5, 8, 'active', NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 hour'),
        ('550e8400-e29b-41d4-a716-446655440005', 'david@example.com', 'david_brown', 'David Brown', 900, 1, 3, 5, 'active', NOW() - INTERVAL '15 days', NOW() - INTERVAL '6 hours')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Added 5 sample users for leaderboard testing';
    END IF;
END $$;

-- Check final user count and data
SELECT 'final_users_count' as info, COUNT(*) as count FROM users;

SELECT 'final_leaderboard_data' as info, id, username, points, level, streak, status,
       ROW_NUMBER() OVER (ORDER BY points DESC) as rank
FROM users 
WHERE status = 'active' 
ORDER BY points DESC;

-- Also check if there are any users without the required columns
DO $$
BEGIN
    -- Check for missing username column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        RAISE NOTICE 'Missing username column in users table';
    END IF;
    
    -- Check for missing points column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
        RAISE NOTICE 'Missing points column in users table';
    END IF;
    
    -- Check for missing status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        RAISE NOTICE 'Missing status column in users table';
    END IF;
    
    -- Check for missing level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        RAISE NOTICE 'Missing level column in users table';
    END IF;
    
    -- Check for missing streak column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'streak') THEN
        RAISE NOTICE 'Missing streak column in users table';
    END IF;
END $$;
