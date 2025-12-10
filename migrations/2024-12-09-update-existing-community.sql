-- Update Existing Community Tables with Enhanced Features
-- This script safely updates existing community tables to add new columns

-- First, check if community_groups table exists and add missing columns
DO $$
BEGIN
    -- Add points_pool column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_groups' 
        AND column_name = 'points_pool'
    ) THEN
        ALTER TABLE public.community_groups ADD COLUMN points_pool INTEGER DEFAULT 0;
        RAISE NOTICE 'Added points_pool column to community_groups';
    END IF;

    -- Add goal_points column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'community_groups' 
        AND column_name = 'goal_points'
    ) THEN
        ALTER TABLE public.community_groups ADD COLUMN goal_points INTEGER DEFAULT 0;
        RAISE NOTICE 'Added goal_points column to community_groups';
    END IF;
END $$;

-- Update group_memberships table if it exists
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_memberships') THEN
        -- Add points_contributed column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'group_memberships' 
            AND column_name = 'points_contributed'
        ) THEN
            ALTER TABLE public.group_memberships ADD COLUMN points_contributed INTEGER DEFAULT 0;
            RAISE NOTICE 'Added points_contributed column to group_memberships';
        END IF;
    END IF;
END $$;

-- Create new tables that don't exist
-- Group point contributions table
CREATE TABLE IF NOT EXISTS public.group_point_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT, -- Optional reason for contribution
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Group challenges table
CREATE TABLE IF NOT EXISTS public.group_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL,
  target_count INTEGER DEFAULT 1,
  current_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Group challenge completions table
CREATE TABLE IF NOT EXISTS public.group_challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(challenge_id, user_id)
);

-- Friend relationships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- Enhanced community posts table (create if doesn't exist)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  verse_reference TEXT,
  verse_text TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  is_friend_only BOOLEAN DEFAULT false,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enhanced community comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Community likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT check_target CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Community shares table
CREATE TABLE IF NOT EXISTS public.community_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  shared_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User activity feed table
CREATE TABLE IF NOT EXISTS public.user_activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'share', 'friend_request', 'friend_accepted')),
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accepted', 'mention', 'group_invite')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create or update the trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_comments_updated_at ON public.community_comments;
CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_groups_updated_at ON public.community_groups;
CREATE TRIGGER update_community_groups_updated_at
BEFORE UPDATE ON public.community_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_challenges_updated_at ON public.group_challenges;
CREATE TRIGGER update_group_challenges_updated_at
BEFORE UPDATE ON public.group_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_group_point_contributions_group_id ON public.group_point_contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_point_contributions_user_id ON public.group_point_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_group_point_contributions_created_at ON public.group_point_contributions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_challenges_group_id ON public.group_challenges(group_id);
CREATE INDEX IF NOT EXISTS idx_group_challenges_is_active ON public.group_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_group_challenges_expires_at ON public.group_challenges(expires_at);

CREATE INDEX IF NOT EXISTS idx_group_challenge_completions_challenge_id ON public.group_challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_group_challenge_completions_user_id ON public.group_challenge_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON public.community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_friend_only ON public.community_posts(is_friend_only);
CREATE INDEX IF NOT EXISTS idx_community_posts_mood ON public.community_posts(mood);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON public.community_posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON public.community_comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_comment_id ON public.community_likes(comment_id);

CREATE INDEX IF NOT EXISTS idx_community_shares_user_id ON public.community_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_community_shares_post_id ON public.community_shares(post_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user_id ON public.user_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_created_at ON public.user_activity_feed(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- Create helper functions for group points management
CREATE OR REPLACE FUNCTION public.increment_group_points(group_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_groups 
  SET points_pool = points_pool + points_to_add
  WHERE id = group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_member_contribution(group_id UUID, user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.group_memberships 
  SET points_contributed = points_contributed + points_to_add
  WHERE group_id = group_id AND user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT SELECT ON public.friendships TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT ON public.community_posts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT SELECT ON public.community_comments TO anon;

GRANT SELECT, INSERT, DELETE ON public.community_likes TO authenticated;
GRANT SELECT ON public.community_likes TO anon;

GRANT SELECT, INSERT, DELETE ON public.community_shares TO authenticated;
GRANT SELECT ON public.community_shares TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_groups TO authenticated;
GRANT SELECT ON public.community_groups TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_memberships TO authenticated;
GRANT SELECT ON public.group_memberships TO anon;

GRANT SELECT, INSERT, DELETE ON public.group_point_contributions TO authenticated;
GRANT SELECT ON public.group_point_contributions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_challenges TO authenticated;
GRANT SELECT ON public.group_challenges TO anon;

GRANT SELECT, INSERT, DELETE ON public.group_challenge_completions TO authenticated;
GRANT SELECT ON public.group_challenge_completions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activity_feed TO authenticated;
GRANT SELECT ON public.user_activity_feed TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT SELECT ON public.user_notifications TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_group_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_member_contribution TO authenticated;

-- Update existing groups with default points values if they don't have them
UPDATE public.community_groups 
SET points_pool = 0, goal_points = 0 
WHERE points_pool IS NULL OR goal_points IS NULL;

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Enhanced community features have been successfully updated!';
  RAISE NOTICE 'Existing tables have been updated with new columns and features';
END $$;
