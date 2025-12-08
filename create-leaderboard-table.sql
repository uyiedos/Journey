-- Create optimized leaderboard table with real-time updates
-- Run this in Supabase SQL Editor

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    weekly_points INTEGER NOT NULL DEFAULT 0,
    monthly_points INTEGER NOT NULL DEFAULT 0,
    rank_position INTEGER,
    previous_rank INTEGER,
    rank_change INTEGER GENERATED ALWAYS AS (previous_rank - rank_position) STORED,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank_position);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_weekly ON leaderboard(weekly_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_streak ON leaderboard(streak DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated ON leaderboard(updated_at DESC);

-- Create weekly_stats table for tracking weekly performance
CREATE TABLE IF NOT EXISTS weekly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    activities_completed INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Create monthly_stats table for tracking monthly performance
CREATE TABLE IF NOT EXISTS monthly_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month_start DATE NOT NULL,
    points_earned INTEGER NOT NULL DEFAULT 0,
    activities_completed INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_start)
);

-- Function to update leaderboard entry
CREATE OR REPLACE FUNCTION update_leaderboard_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert leaderboard entry
    INSERT INTO leaderboard (
        user_id, 
        username, 
        avatar_url, 
        total_points, 
        level, 
        streak, 
        longest_streak,
        weekly_points,
        monthly_points,
        last_activity,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.username, 'Anonymous'),
        NEW.avatar_url,
        COALESCE(NEW.points, 0),
        COALESCE(NEW.level, 1),
        COALESCE(NEW.streak, 0),
        COALESCE(NEW.longest_streak, 0),
        0, -- Will be updated by separate function
        0, -- Will be updated by separate function
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        username = COALESCE(NEW.username, EXCLUDED.username),
        avatar_url = NEW.avatar_url,
        total_points = COALESCE(NEW.points, EXCLUDED.total_points),
        level = COALESCE(NEW.level, EXCLUDED.level),
        streak = COALESCE(NEW.streak, EXCLUDED.streak),
        longest_streak = COALESCE(NEW.longest_streak, EXCLUDED.longest_streak),
        last_activity = NOW(),
        updated_at = NOW();
    
    -- Update rank positions
    SELECT update_leaderboard_ranks();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update rank positions
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS VOID AS $$
BEGIN
    -- Update rank positions based on total points
    UPDATE leaderboard 
    SET rank_position = ranks.new_rank,
        previous_rank = leaderboard.rank_position
    FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_points DESC, updated_at ASC) as new_rank
        FROM leaderboard
    ) ranks
    WHERE leaderboard.user_id = ranks.user_id;
    
    -- Handle new users (no previous rank)
    UPDATE leaderboard 
    SET previous_rank = rank_position
    WHERE previous_rank IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update weekly stats
CREATE OR REPLACE FUNCTION update_weekly_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_week_start DATE;
    weekly_points_diff INTEGER;
BEGIN
    -- Calculate current week start (Monday)
    current_week_start := date_trunc('week', CURRENT_DATE);
    
    -- Calculate points difference for this week
    SELECT COALESCE(NEW.points, 0) - COALESCE(OLD.points, 0)
    INTO weekly_points_diff;
    
    -- Update weekly stats
    INSERT INTO weekly_stats (user_id, week_start, points_earned)
    VALUES (NEW.id, current_week_start, weekly_points_diff)
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
        points_earned = weekly_stats.points_earned + weekly_points_diff,
        updated_at = NOW();
    
    -- Update weekly points in leaderboard
    UPDATE leaderboard 
    SET weekly_points = (
        SELECT SUM(points_earned)
        FROM weekly_stats
        WHERE user_id = NEW.id 
        AND week_start >= current_week_start
    )
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update monthly stats
CREATE OR REPLACE FUNCTION update_monthly_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_month_start DATE;
    monthly_points_diff INTEGER;
BEGIN
    -- Calculate current month start
    current_month_start := date_trunc('month', CURRENT_DATE);
    
    -- Calculate points difference for this month
    SELECT COALESCE(NEW.points, 0) - COALESCE(OLD.points, 0)
    INTO monthly_points_diff;
    
    -- Update monthly stats
    INSERT INTO monthly_stats (user_id, month_start, points_earned)
    VALUES (NEW.id, current_month_start, monthly_points_diff)
    ON CONFLICT (user_id, month_start)
    DO UPDATE SET
        points_earned = monthly_stats.points_earned + monthly_points_diff,
        updated_at = NOW();
    
    -- Update monthly points in leaderboard
    UPDATE leaderboard 
    SET monthly_points = (
        SELECT SUM(points_earned)
        FROM monthly_stats
        WHERE user_id = NEW.id 
        AND month_start >= current_month_start
    )
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
-- Trigger on users table for updates
DROP TRIGGER IF EXISTS on_user_update_leaderboard ON users;
CREATE TRIGGER on_user_update_leaderboard
    AFTER UPDATE OF points, level, streak, longest_streak, username, avatar_url
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_entry();

-- Trigger for weekly stats
DROP TRIGGER IF EXISTS on_user_update_weekly_stats ON users;
CREATE TRIGGER on_user_update_weekly_stats
    AFTER UPDATE OF points
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_stats();

-- Trigger for monthly stats
DROP TRIGGER IF EXISTS on_user_update_monthly_stats ON users;
CREATE TRIGGER on_user_update_monthly_stats
    AFTER UPDATE OF points
    ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_stats();

-- Initial data migration
INSERT INTO leaderboard (user_id, username, avatar_url, total_points, level, streak, longest_streak, rank_position)
SELECT 
    id,
    COALESCE(username, 'Anonymous'),
    avatar_url,
    COALESCE(points, 0),
    COALESCE(level, 1),
    COALESCE(streak, 0),
    COALESCE(longest_streak, 0),
    0
FROM users
WHERE id NOT IN (SELECT user_id FROM leaderboard)
ORDER BY COALESCE(points, 0) DESC;

-- Update initial ranks
SELECT update_leaderboard_ranks();

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for leaderboard
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard;
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own leaderboard entry" ON leaderboard;
CREATE POLICY "Users can view own leaderboard entry" ON leaderboard FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for weekly stats
DROP POLICY IF EXISTS "Anyone can view weekly stats" ON weekly_stats;
CREATE POLICY "Anyone can view weekly stats" ON weekly_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own weekly stats" ON weekly_stats;
CREATE POLICY "Users can view own weekly stats" ON weekly_stats FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for monthly stats
DROP POLICY IF EXISTS "Anyone can view monthly stats" ON monthly_stats;
CREATE POLICY "Anyone can view monthly stats" ON monthly_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own monthly stats" ON monthly_stats;
CREATE POLICY "Users can view own monthly stats" ON monthly_stats FOR SELECT USING (auth.uid() = user_id);

-- Create view for easy leaderboard queries
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    l.*,
    u.email,
    u.full_name,
    u.created_at as user_created_at,
    CASE 
        WHEN l.rank_change > 0 THEN 'up'
        WHEN l.rank_change < 0 THEN 'down'
        ELSE 'same'
    END as rank_trend
FROM leaderboard l
LEFT JOIN users u ON l.user_id = u.id
ORDER BY l.rank_position;

-- Grant permissions
GRANT SELECT ON leaderboard TO anon, authenticated;
GRANT SELECT ON weekly_stats TO anon, authenticated;
GRANT SELECT ON monthly_stats TO anon, authenticated;
GRANT SELECT ON leaderboard_view TO anon, authenticated;

-- Verify table structures
SELECT 'leaderboard' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leaderboard' 
ORDER BY ordinal_position;

-- Test the setup
SELECT 'Initial leaderboard data count' as info, COUNT(*) as count FROM leaderboard;
SELECT 'Top 5 leaderboard entries' as info, username, total_points, rank_position, rank_change
FROM leaderboard 
ORDER BY rank_position 
LIMIT 5;
