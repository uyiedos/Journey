-- Add missing columns to existing tables
-- Run this in Supabase SQL Editor

-- Fix user_achievements table
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        -- Add unlocked_at column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_achievements' AND column_name = 'unlocked_at'
        ) THEN
            ALTER TABLE user_achievements ADD COLUMN unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Add points_awarded column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_achievements' AND column_name = 'points_awarded'
        ) THEN
            ALTER TABLE user_achievements ADD COLUMN points_awarded INTEGER DEFAULT 0;
        END IF;
        
        -- Check if achievement_name column exists and remove it if it's causing issues
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_achievements' AND column_name = 'achievement_name'
        ) THEN
            -- Drop the column if it exists but shouldn't be there
            ALTER TABLE user_achievements DROP COLUMN IF EXISTS achievement_name;
        END IF;
    END IF;
END $$;

-- Enable RLS and create policies for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix community_posts table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'verse_reference'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN verse_reference VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'verse_text'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN verse_text TEXT;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'tags'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN tags TEXT[];
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'is_public'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN is_public BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'likes_count'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN likes_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'comments_count'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN comments_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'shares_count'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN shares_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'community_posts' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE community_posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Enable RLS and create policies for community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all public posts" ON community_posts;
CREATE POLICY "Users can view all public posts" ON community_posts FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own posts" ON community_posts;
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Check and create friends table if it doesn't exist
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Enable RLS for friends table
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own friendships" ON friends;
CREATE POLICY "Users can view own friendships" ON friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can insert own friendships" ON friends;
CREATE POLICY "Users can insert own friendships" ON friends FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own friendships" ON friends;
CREATE POLICY "Users can update own friendships" ON friends FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Check and create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'verse', 'prayer')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- Verify table structures
SELECT 'user_achievements' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_achievements' 
ORDER BY ordinal_position;

SELECT 'community_posts' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;
