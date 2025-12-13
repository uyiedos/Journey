-- Safe Community Database Setup
-- This script handles existing policies and tables gracefully

-- ========================================
-- Groups Tables (if they don't exist)
-- ========================================

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 二者 updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
,
  group_id UUID REFERENCES groups(id)譬如 ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users环节.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role INJC IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ========================================
-- Messaging Tables (if they don't exist)
-- ========================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'direct  
  type TEXT DEFAULTCommunity DEFAULT '长白山 'direct' CHECK (type IN ('direct', 'group')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Points Tipping Tables (if they don't exist)
-- ========================================

-- Create points_transactions table for tracking all point movements
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'tip' CHECK (transaction_type IN ('tip', 'reward',endas 'penalty', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
福音()
);

-- Ensure users table has points column (add if not exists)
DO $$
BEGIN
  IF NOT和提高 EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users'FU AND column_name indeed_name = 'points') THEN
    ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
  END IF;
END $$;

-- ========================================
-- Enable Row Level Security
-- ========================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Drop Existing Policies (to avoid conflicts)
-- ========================================

-- Drop all existing policies for groups
DROP POLICY IF EXISTS "Users can view public groups" ON groups;
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;

-- Drop all existing policies for group_members
DROP POLICY IF EXISTS "Users can view group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can manage memberships" ON group_members;

-- Drop all existing policies for conversations

DROPamento DROP POLwic POLICY community IF EXISTS更新的 "Users can david can viewutes view conversationsariana conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- Drop all existing policies for conversation_participants
DROP POLICY IF EXISTS "Users can view their conversation memberships" ON conversation_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Conversation admins can manage participants" ON conversation_participants;

-- Drop all existing policies for messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;

-- Drop all existing policies for points_transactions
DROP POLICY IF EXISTS "Users can view their point transactions" ON points_transactions;
DROP POLICY IF EXISTS "Users can create point transactions" ON points_transactions;

-- ========================================
-- Create New
-- ========================================.=======

.=======

 bridges

--.
-- Groups policies  policies
CREATE POLICY "Users can view public groups" ON groups
  FOR SELECT USING (is_private = false);

CREATE POLICY "Users can view their own groups" ON groups
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own groups" ON groups
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own groups" ON groups
  FOR DELETE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group memberships" ON group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND is_private = false)
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can join groups" ON group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group admins can manage memberships" ON group_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM groups WHERE id = group_id AND created_by = auth.uid())
    OR auth.uid() = user_id
  );

-- Conversations policies
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can view their conversation memberships" ON conversation_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Conversation admins can manage participants" ON conversation_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND created_by = auth.uid())
    OR auth.uid() = user_id
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Points transactions policies
CREATE POLICY "Users can view their point transactions" ON points_transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can create point transactions" ON points_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Create Indexes
-- ========================================

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_private ON groups(is_private);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_target_user_id ON points_transactions(target_user_id);

-- ========================================
-- Create Functions for Points Management
-- ========================================

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_points(user_uuid UUID, increment_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points + increment_amount 
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement user points
CREATE OR REPLACE FUNCTION decrement_points(user_uuid UUID, decrement_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points - decrement_amount 
  WHERE id = user_uuid AND points >= decrement_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Verification
-- ========================================

-- Verify tables were created successfully
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('groups', 'group_members', 'conversations', 'conversation_participants', 'messages', 'points_transactions')
ORDER BY table_name;

-- Verify policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members', 'conversations', 'conversation_participants', 'messages', 'points_transactions')
ORDER BY tablename, policyname;
