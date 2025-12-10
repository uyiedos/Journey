-- Complete fix for likes table
-- Run this in Supabase SQL Editor

-- 1. Drop table if it exists to recreate with correct schema
DROP TABLE IF EXISTS likes CASCADE;

-- 2. Create the likes table with correct schema
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL, -- Changed to TEXT to support both UUID and string IDs
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'devotional', 'prayer', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- 3. Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own likes" ON likes;
CREATE POLICY "Users can insert own likes" ON likes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes" ON likes 
FOR DELETE USING (auth.uid() = user_id);

-- 5. Create indexes for better performance
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_id, target_type);
CREATE INDEX idx_likes_created_at ON likes(created_at);

-- 6. Create function to check if user liked something
CREATE OR REPLACE FUNCTION public.user_has_liked(
    p_user_id UUID,
    p_target_id TEXT,
    p_target_type VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM likes 
        WHERE user_id = p_user_id 
        AND target_id = p_target_id 
        AND target_type = p_target_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_like(
    p_user_id UUID,
    p_target_id TEXT,
    p_target_type VARCHAR(20)
) RETURNS JSONB AS $$
DECLARE
    like_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Check if like already exists
    SELECT EXISTS(
        SELECT 1 FROM likes 
        WHERE user_id = p_user_id 
        AND target_id = p_target_id 
        AND target_type = p_target_type
    ) INTO like_exists;
    
    IF like_exists THEN
        -- Remove the like
        DELETE FROM likes 
        WHERE user_id = p_user_id 
        AND target_id = p_target_id 
        AND target_type = p_target_type;
        
        result := jsonb_build_object(
            'success', true,
            'action', 'unliked',
            'message', 'Like removed'
        );
    ELSE
        -- Add the like
        INSERT INTO likes (user_id, target_id, target_type)
        VALUES (p_user_id, p_target_id, p_target_type);
        
        result := jsonb_build_object(
            'success', true,
            'action', 'liked',
            'message', 'Like added'
        );
    END IF;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to toggle like'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to get like count
CREATE OR REPLACE FUNCTION public.get_like_count(
    p_target_id TEXT,
    p_target_type VARCHAR(20)
) RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::BIGINT 
        FROM likes 
        WHERE target_id = p_target_id 
        AND target_type = p_target_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Verify table creation
SELECT 
    'likes' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;

-- 10. Test the functions (optional - you can comment these out)
-- SELECT public.user_has_liked('test-user-id', 'post-1', 'post');
-- SELECT public.get_like_count('post-1', 'post');
