-- Fix user points based on actual activities
-- Run this after checking the results from check_user_points.sql

-- First, let's see what we're working with
SELECT 
    id,
    username,
    email,
    points as current_points,
    level as current_level
FROM users 
WHERE email = 'uyiedos@gmail.com' OR username = 'Blackralph';

-- Calculate the correct points based on actual activities
WITH calculated_points AS (
    SELECT 
        u.id,
        -- Reading plan points (5 points per day completed)
        COALESCE(
            (SELECT SUM(rp.current_day - 1) * 5 
             FROM user_reading_plans rp 
             WHERE rp.user_id = u.id), 0
        ) +
        -- Achievement points (use fixed estimate since achievement_definitions table doesn't exist)
        COALESCE(
            (SELECT COUNT(*) * 50  -- 50 points per achievement estimate
             FROM user_achievements ua 
             WHERE ua.user_id = u.id), 0
        ) +
        -- Daily login rewards (5 points per day)
        COALESCE(
            (SELECT COUNT(*) * 5 
             FROM daily_login_rewards dr 
             WHERE dr.user_id = u.id), 0
        ) +
        -- Base starting points
        10 +
        -- Streak bonus (2 points per streak day)
        COALESCE(u.streak, 0) * 2
        as calculated_points
    FROM users u
    WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
),
correct_level AS (
    SELECT 
        u.id,
        cp.calculated_points,
        -- Calculate level based on points (100 points per level)
        GREATEST(1, FLOOR(cp.calculated_points / 100)) as correct_level
    FROM users u
    JOIN calculated_points cp ON u.id = cp.id
    WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
)
-- Update the user's points and level
UPDATE users 
SET 
    points = cl.calculated_points,
    level = cl.correct_level,
    updated_at = NOW()
FROM correct_level cl
WHERE users.id = cl.id;

-- Verify the update
SELECT 
    id,
    username,
    email,
    points as corrected_points,
    level as corrected_level,
    streak,
    updated_at
FROM users 
WHERE email = 'uyiedos@gmail.com' OR username = 'Blackralph';

-- Show the breakdown for transparency
SELECT 
    'Reading Plans' as activity_type,
    COALESCE((SELECT SUM(rp.current_day - 1) * 5 
              FROM user_reading_plans rp 
              WHERE rp.user_id = u.id), 0) as points
FROM users u
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'

UNION ALL

SELECT 
    'Achievements' as activity_type,
    COALESCE((SELECT COUNT(*) * 50 
              FROM user_achievements ua 
              WHERE ua.user_id = u.id), 0) as points
FROM users u
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'

UNION ALL

SELECT 
    'Daily Login Rewards' as activity_type,
    COALESCE((SELECT COUNT(*) * 5 
              FROM daily_login_rewards dr 
              WHERE dr.user_id = u.id), 0) as points
FROM users u
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'

UNION ALL

SELECT 
    'Base Starting Points' as activity_type,
    10 as points

UNION ALL

SELECT 
    'Streak Bonus' as activity_type,
    COALESCE(u.streak, 0) * 2 as points
FROM users u
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph';
