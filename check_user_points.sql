-- Check user activities and calculate correct points for uyiedos@gmail.com (Blackralph)

-- 1. First, get the user's basic info
SELECT 
    id,
    username,
    email,
    points as current_points,
    level as current_level,
    streak,
    created_at
FROM users 
WHERE email = 'uyiedos@gmail.com' OR username = 'Blackralph';

-- 2. Check user reading plans and progress
SELECT 
    u.username,
    u.email,
    rp.plan_id,
    rp.current_day,
    rp.completed_at,
    pl.title as plan_title
FROM user_reading_plans rp
JOIN users u ON rp.user_id = u.id
JOIN reading_plans pl ON rp.plan_id = pl.id
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
ORDER BY rp.plan_id;

-- 3. Check user achievements
SELECT 
    u.username,
    u.email,
    ua.achievement_id,
    ua.unlocked_at,
    ad.name as achievement_name,
    ad.points as achievement_points,
    ad.category
FROM user_achievements ua
JOIN users u ON ua.user_id = u.id
LEFT JOIN achievement_definitions ad ON ua.achievement_id = ad.id
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
ORDER BY ua.unlocked_at;

-- 4. Check daily login rewards
SELECT 
    u.username,
    u.email,
    dr.reward_date,
    dr.points_awarded,
    dr.streak_day,
    dr.claimed_at
FROM daily_login_rewards dr
JOIN users u ON dr.user_id = u.id
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
ORDER BY dr.reward_date;

-- 5. Check any manual point adjustments or other point-earning activities
SELECT 
    u.username,
    u.email,
    'Other Activity' as activity_type,
    'Check manually' as details
FROM users u
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph';

-- 6. Calculate what the points should be based on activities
WITH user_activities AS (
    -- Reading plan completions
    SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(SUM(CASE 
            WHEN rp.completed_at IS NOT NULL THEN pl.points_reward 
            ELSE (rp.current_day - 1) * 5  -- 5 points per day for incomplete plans
        END), 0) as reading_points
    FROM users u
    LEFT JOIN user_reading_plans rp ON u.id = rp.user_id
    LEFT JOIN reading_plans pl ON rp.plan_id = pl.id
    WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
    GROUP BY u.id, u.username, u.email
    
    UNION ALL
    
    -- Achievement points
    SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(SUM(ad.points), 0) as achievement_points
    FROM users u
    LEFT JOIN user_achievements ua ON u.id = ua.user_id
    LEFT JOIN achievement_definitions ad ON ua.achievement_id = ad.id
    WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
    GROUP BY u.id, u.username, u.email
    
    UNION ALL
    
    -- Daily login rewards
    SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(SUM(dr.points_awarded), 0) as daily_points
    FROM users u
    LEFT JOIN daily_login_rewards dr ON u.id = dr.user_id
    WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph'
    GROUP BY u.id, u.username, u.email
),
total_calculated AS (
    SELECT 
        id,
        username,
        email,
        SUM(reading_points) as total_reading_points,
        SUM(achievement_points) as total_achievement_points,
        SUM(daily_points) as total_daily_points,
        SUM(reading_points + achievement_points + daily_points) as total_calculated_points
    FROM user_activities
    GROUP BY id, username, email
)
SELECT 
    tc.*,
    u.points as current_points,
    u.level as current_level,
    u.streak as current_streak,
    (tc.total_calculated_points - u.points) as point_difference,
    CASE 
        WHEN u.points > tc.total_calculated_points THEN 'Overinflated'
        WHEN u.points = tc.total_calculated_points THEN 'Accurate'
        ELSE 'Underinflated'
    END as status
FROM total_calculated tc
JOIN users u ON tc.id = u.id
WHERE u.email = 'uyiedos@gmail.com' OR u.username = 'Blackralph';
