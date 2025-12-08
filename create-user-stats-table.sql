-- Create user_stats table if it doesn't exist
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    verses_read INTEGER DEFAULT 0,
    chapters_completed INTEGER DEFAULT 0,
    devotionals_created INTEGER DEFAULT 0,
    prayers_shared INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    community_posts INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    referrals_completed INTEGER DEFAULT 0,
    daily_challenges_completed INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON user_stats(total_points_earned);

-- Add community_posts column if it doesn't exist (for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_stats' AND column_name = 'community_posts'
    ) THEN
        ALTER TABLE user_stats ADD COLUMN community_posts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create stats for existing users who don't have them
INSERT INTO user_stats (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM user_stats);

-- Verify the table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
ORDER BY ordinal_position;
