-- Step 2: Add RLS Policies and Triggers (Run this AFTER Step 1 succeeds)
-- Only run this after the tables have been created successfully

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

-- Functions for updating counts

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
