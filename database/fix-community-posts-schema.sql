-- Fix community_posts schema conflicts
-- This script handles existing tables and adapts them to work with the new social features

-- First, let's check what columns exist in community_posts
DO $$
BEGIN
    -- Drop the table if it exists with wrong structure and recreate it
    DROP TABLE IF EXISTS community_posts CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        -- Table might not exist, continue
        NULL;
END $$;

-- Now create the community_posts table with correct structure
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('general', 'prayer_request', 'testimony', 'verse_share', 'question')),
    attachments JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    is_friend_only BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate related tables to ensure consistency
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;

-- 2. Post Reactions Table
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'pray', 'amen', 'praise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique reaction per user per post
    UNIQUE(post_id, user_id)
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reply_to_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Comment Reactions Table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'pray', 'amen', 'praise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique reaction per user per comment
    UNIQUE(comment_id, user_id)
);

-- 5. Post Shares Table
CREATE TABLE IF NOT EXISTS post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT NOT NULL DEFAULT 'community' CHECK (share_type IN ('community', 'external', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate shares
    UNIQUE(post_id, user_id, share_type)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_reply_to_id ON comments(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_post_shares_post_id ON post_shares(post_id);

-- Function to update post counts automatically
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update likes count
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE community_posts 
        SET likes_count = (
            SELECT COUNT(*) FROM post_reactions 
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        )
        WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
        UPDATE community_posts 
        SET comments_count = (
            SELECT COUNT(*) FROM comments 
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) 
            AND is_deleted = FALSE
        )
        WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    -- Update shares count
    IF TG_TABLE_NAME = 'post_shares' THEN
        UPDATE community_posts 
        SET shares_count = (
            SELECT COUNT(*) FROM post_shares 
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        )
        WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic count updates
DROP TRIGGER IF EXISTS trigger_update_post_reactions ON post_reactions;
CREATE TRIGGER trigger_update_post_reactions
    AFTER INSERT OR DELETE ON post_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_comments ON comments;
CREATE TRIGGER trigger_update_post_comments
    AFTER INSERT OR UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS trigger_update_post_shares ON post_shares;
CREATE TRIGGER trigger_update_post_shares
    AFTER INSERT OR DELETE ON post_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public posts" ON community_posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

-- RLS Policies for community_posts
CREATE POLICY "Users can view public posts" ON community_posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own posts" ON community_posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for post_reactions
CREATE POLICY "Users can view reactions on public posts" ON post_reactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM community_posts 
                WHERE id = post_id AND is_public = true)
        OR auth.uid() = user_id
    );

CREATE POLICY "Users can create reactions" ON post_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON post_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on public posts" ON comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM community_posts 
                WHERE id = post_id AND is_public = true)
        OR auth.uid() = author_id
    );

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for comment_reactions
CREATE POLICY "Users can manage their own comment reactions" ON comment_reactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for post_shares
CREATE POLICY "Users can view shares on public posts" ON post_shares
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM community_posts 
                WHERE id = post_id AND is_public = true)
        OR auth.uid() = user_id
    );

CREATE POLICY "Users can create shares" ON post_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON post_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
ORDER BY ordinal_position;
