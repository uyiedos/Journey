-- Step 1: Create Tables Only (No RLS Policies)
-- Run this first to create the basic tables

-- 1. Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate friend requests
    UNIQUE(requester_id, addressee_id),
    
    -- Prevent self-friend requests
    CHECK (requester_id != addressee_id)
);

-- 2. Community Groups Table
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Group Memberships Table
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate memberships
    UNIQUE(group_id, user_id)
);

-- 4. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
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

-- 5. User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'points_awarded', 'points_spent', 'achievement_unlocked', 'group_invite', 'post_like', 'post_comment')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data related to the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Community Likes Table
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate likes
    UNIQUE(user_id, post_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE INDEX IF NOT EXISTS idx_community_groups_created_by ON community_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_community_groups_is_private ON community_groups(is_private);

CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_role ON group_memberships(role);

CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_mood ON community_posts(mood);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_likes_user ON community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);

-- Grant basic permissions
GRANT ALL ON friendships TO authenticated;
GRANT ALL ON community_groups TO authenticated;
GRANT ALL ON group_memberships TO authenticated;
GRANT ALL ON community_posts TO authenticated;
GRANT ALL ON user_notifications TO authenticated;
GRANT ALL ON community_likes TO authenticated;
