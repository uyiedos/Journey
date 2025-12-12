-- Supabase Migration Script for Community Features
-- Run this in your Supabase SQL Editor to create the necessary tables

-- 1. Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate friend requests
    UNIQUE(requester_id, addressee_id),
    
    -- Prevent self-friend requests
    CHECK (requester_id != addressee_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- 2. Community Groups Table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for groups
CREATE INDEX IF NOT EXISTS idx_community_groups_created_by ON community_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_community_groups_is_private ON community_groups(is_private);

-- 3. Group Memberships Table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate memberships
    UNIQUE(group_id, user_id)
);

-- Add indexes for group memberships
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_role ON group_memberships(role);

-- 4. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    verse_reference TEXT,
    verse_text TEXT,
    image_url TEXT,
    mood TEXT CHECK (mood IN ('happy', 'grateful', 'thoughtful', 'prayerful', 'inspired')),
    tags TEXT[], -- Array of tags
    is_public BOOLEAN DEFAULT TRUE,
    is_friend_only BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for community posts
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_mood ON community_posts(mood);

-- 5. User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'points_awarded', 'points_spent', 'achievement_unlocked', 'group_invite', 'post_like', 'post_comment')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data related to the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- 6. Community Likes Table (for tracking post likes)
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate likes
    UNIQUE(user_id, post_id)
);

-- Add indexes for likes
CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);

-- 7. Functions for updating counts

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating post like count
CREATE TRIGGER trigger_update_post_like_count
    AFTER INSERT OR DELETE ON community_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating group member count
CREATE TRIGGER trigger_update_group_member_count
    AFTER INSERT OR DELETE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Friendships RLS Policies
CREATE POLICY "Users can view their own friendships" ON friendships
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can insert their own friend requests" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own friendships" ON friendships
    FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Community Groups RLS Policies
CREATE POLICY "Anyone can view public groups" ON community_groups
    FOR SELECT USING (is_private = FALSE OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create groups" ON community_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON community_groups
    FOR UPDATE USING (auth.uid() = created_by);

-- Group Memberships RLS Policies
CREATE POLICY "Users can view group memberships they belong to" ON group_memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join public groups" ON group_memberships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (
            SELECT 1 FROM community_groups 
            WHERE id = group_id AND is_private = FALSE
        )
    );

CREATE POLICY "Users can leave their own memberships" ON group_memberships
    FOR DELETE USING (auth.uid() = user_id);

-- Community Posts RLS Policies
CREATE POLICY "Anyone can view public posts" ON community_posts
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own posts" ON community_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- User Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Community Likes RLS Policies
CREATE POLICY "Users can view likes on posts" ON community_likes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON community_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON community_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON friendships TO authenticated;
GRANT ALL ON community_groups TO authenticated;
GRANT ALL ON group_memberships TO authenticated;
GRANT ALL ON community_posts TO authenticated;
GRANT ALL ON user_notifications TO authenticated;
GRANT ALL ON community_likes TO authenticated;
