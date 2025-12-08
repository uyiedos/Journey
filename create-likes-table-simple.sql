-- Simple likes table creation
-- Run this in Supabase SQL Editor

-- Create the likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'devotional', 'prayer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can view all likes'
    ) THEN
        CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can insert own likes'
    ) THEN
        CREATE POLICY "Users can insert own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'likes' AND policyname = 'Users can delete own likes'
    ) THEN
        CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_id, target_type);

-- Verify table structure
SELECT 'likes' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;
