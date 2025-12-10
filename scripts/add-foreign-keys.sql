-- Add Foreign Key Constraints to Community Tables
-- Run this after creating the basic tables

-- Add foreign key constraints for friendships
ALTER TABLE friendships 
ADD CONSTRAINT fk_friendships_requester 
FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE friendships 
ADD CONSTRAINT fk_friendships_addressee 
FOREIGN KEY (addressee_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints for conversations
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversation_participants 
ADD CONSTRAINT fk_conversation_participants_conversation 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE conversation_participants 
ADD CONSTRAINT fk_conversation_participants_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_conversation 
FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
ADD CONSTRAINT fk_messages_reply 
FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Add foreign key constraints for community posts
ALTER TABLE community_posts 
ADD CONSTRAINT fk_community_posts_author 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints for comments
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_post 
FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_author 
FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_reply 
FOREIGN KEY (reply_to_id) REFERENCES comments(id) ON DELETE SET NULL;

-- Add foreign key constraints for reactions
ALTER TABLE post_reactions 
ADD CONSTRAINT fk_post_reactions_post 
FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE;

ALTER TABLE post_reactions 
ADD CONSTRAINT fk_post_reactions_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE comment_reactions 
ADD CONSTRAINT fk_comment_reactions_comment 
FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE comment_reactions 
ADD CONSTRAINT fk_comment_reactions_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints for bible study groups
ALTER TABLE bible_study_groups 
ADD CONSTRAINT fk_bible_study_groups_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE group_memberships 
ADD CONSTRAINT fk_group_memberships_group 
FOREIGN KEY (group_id) REFERENCES bible_study_groups(id) ON DELETE CASCADE;

ALTER TABLE group_memberships 
ADD CONSTRAINT fk_group_memberships_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key constraints for notifications
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
