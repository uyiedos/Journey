-- Enhanced Community Schema using public.user

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

-- Community posts table (enhanced)
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
  mood TEXT, -- happy, grateful, thoughtful, etc.
  tags TEXT[], -- array of tags
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Community comments table (enhanced)
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE, -- for replies
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Community likes table (for posts and comments)
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
  shared_to TEXT, -- 'timeline', 'friends', 'groups', etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Community groups table (enhanced with points pool)
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_count INTEGER DEFAULT 0,
  points_pool INTEGER DEFAULT 0, -- Total points contributed by members
  goal_points INTEGER DEFAULT 0, -- Optional goal for group challenges
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Group memberships table (enhanced with points tracking)
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
  points_contributed INTEGER DEFAULT 0, -- Points this member has contributed to the group
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Group points contributions table (track all contributions)
CREATE TABLE IF NOT EXISTS public.group_point_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT, -- Optional reason for contribution (e.g., 'daily devotion', 'challenge completed')
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Group challenges table (for group goals and activities)
CREATE TABLE IF NOT EXISTS public.group_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL, -- Points awarded to group pool when completed
  target_count INTEGER DEFAULT 1, -- How many members need to complete
  current_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- Optional expiration
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

-- User activity feed table
CREATE TABLE IF NOT EXISTS public.user_activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'share', 'friend_request', 'friend_accepted')),
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- user who performed the action
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
  data JSONB, -- additional data like post_id, user_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_groups_updated_at
BEFORE UPDATE ON public.community_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
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

CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_group_point_contributions_group_id ON public.group_point_contributions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_point_contributions_user_id ON public.group_point_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_group_point_contributions_created_at ON public.group_point_contributions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_challenges_group_id ON public.group_challenges(group_id);
CREATE INDEX IF NOT EXISTS idx_group_challenges_is_active ON public.group_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_group_challenges_expires_at ON public.group_challenges(expires_at);

CREATE INDEX IF NOT EXISTS idx_group_challenge_completions_challenge_id ON public.group_challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_group_challenge_completions_user_id ON public.group_challenge_completions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_feed_user_id ON public.user_activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_feed_created_at ON public.user_activity_feed(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- Grant permissions
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
