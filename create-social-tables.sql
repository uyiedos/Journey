-- Create RPC function for safe count updates
CREATE OR REPLACE FUNCTION increment_count(
  table_name TEXT,
  record_id UUID,
  column_name TEXT,
  increment_value INTEGER
)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = GREATEST(0, %I + %s) WHERE id = $1',
    table_name,
    column_name,
    column_name,
    increment_value
  ) USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create social interaction tables
-- Run this in Supabase SQL Editor

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'devotional', 'prayer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'devotional', 'prayer')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'devotional', 'prayer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Add count columns to existing tables if they don't exist
DO $$
BEGIN
    -- Add to community_posts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts') THEN
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
    END IF;

    -- Add to devotionals
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'devotionals') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'devotionals' AND column_name = 'likes_count'
        ) THEN
            ALTER TABLE devotionals ADD COLUMN likes_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'devotionals' AND column_name = 'comments_count'
        ) THEN
            ALTER TABLE devotionals ADD COLUMN comments_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'devotionals' AND column_name = 'shares_count'
        ) THEN
            ALTER TABLE devotionals ADD COLUMN shares_count INTEGER DEFAULT 0;
        END IF;
    END IF;

    -- Add to prayer_requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prayer_requests') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prayer_requests' AND column_name = 'likes_count'
        ) THEN
            ALTER TABLE prayer_requests ADD COLUMN likes_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prayer_requests' AND column_name = 'comments_count'
        ) THEN
            ALTER TABLE prayer_requests ADD COLUMN comments_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'prayer_requests' AND column_name = 'shares_count'
        ) THEN
            ALTER TABLE prayer_requests ADD COLUMN shares_count INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_target ON shares(target_id, target_type);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes
DROP POLICY IF EXISTS "Users can view own likes" ON likes;
CREATE POLICY "Users can view own likes" ON likes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own likes" ON likes;
CREATE POLICY "Users can insert own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for comments
DROP POLICY IF EXISTS "Users can view comments" ON comments;
CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shares
DROP POLICY IF EXISTS "Users can view own shares" ON shares;
CREATE POLICY "Users can view own shares" ON shares FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own shares" ON shares;
CREATE POLICY "Users can insert own shares" ON shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verify table structures
SELECT 'likes' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;

SELECT 'comments' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'comments' 
ORDER BY ordinal_position;

SELECT 'shares' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shares' 
ORDER BY ordinal_position;
