-- Fix likes table RLS policies
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own likes" ON likes;

-- Create new policy that allows viewing all likes (for counting)
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);

-- Keep existing policies for insert/delete
DROP POLICY IF EXISTS "Users can insert own likes" ON likes;
CREATE POLICY "Users can insert own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Verify the table exists and has the right structure
SELECT 'likes' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;
