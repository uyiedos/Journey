-- Complete removal of community posts and related tables
-- This will delete all data and drop all tables

-- Drop views first (if they exist)
DROP VIEW IF EXISTS community_posts_with_author CASCADE;

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS post_reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;

-- Also drop other community-related tables if you want a complete cleanup
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS bible_study_groups CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- Optional: Drop profiles table if you created it
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Commit the changes
COMMIT;
