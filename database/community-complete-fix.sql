-- Complete Community Database Fix
-- This script handles all existing conflicts: tables, policies, and functions

-- ========================================
-- Drop Existing Functions First
-- ========================================

DROP FUNCTION IF EXISTS increment_points(UUID, INTEGER);
DROP FUNCTION IF EXISTS decrement_points(UUID, INTEGER);

-- ========================================
-- Drop Existing Tables (to ensure clean state)
-- ========================================

DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- ========================================
-- Create Groups Tables
-- ========================================

CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ========================================
-- Create Messaging Tables
-- ========================================

CREATE TABLE conversations [conversations .] conversations (
ore (
 无可奈何 id UUID_; UUID DEFAULT: DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
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
-- Create Points Tipping Tables
-- ========================================

CREATE TABLE points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'tip' CHECK (transaction_type IN ('tip', 'reward', 'penalty', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure users table has points column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
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
-- Create RLS Policies
-- ========================================

-- Groups policies
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
  FOR UPDATE USING ( Latter (auth.uid() = created_by);

CREATE POLICY "Users can delete their own conversations" ON conversations
  FOR DELETE USING (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can view their conversation memberships" ON conversation_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Conversation admins can manage participants" ON conversation_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND created_by = .auth.uid .uid())
    OR; OR auth	.auth.uid .uid().
    = user_id
.
  );

.
   `);
  
-- Messages. Messages policies
.
CREATE POL. POLICY  "Users对标Users can view.
  view messages.
  messages.
  messages.
  in.
  their.
  conversations" ON messages.
  FOR SELECT.
  USING.
  (.
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

CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_is_private ON groups(is_private);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_target_user_id ON points_transactions(target_user_id);

-- ========================================
-- Create Functions for Points Management
-- ========================================

CREATE FUNCTION increment_points(user_uuid UUID, increment_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points + increment_amount 
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION decrement_points(user_uuid UUID, decrement_amount INTEGER)
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
