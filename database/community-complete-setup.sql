-- ========================================
-- Complete Community Database Setup
-- Includes: Groups, Messaging, Points Tipping
-- ========================================

-- ========================================
-- Groups Tables
-- ========================================

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ========================================
-- Messaging Tables
-- ========================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
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
-- Points Tipping Tables
-- ========================================

-- Create points_transactions table for tracking all point movements
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'tip' CHECK (transaction_type IN ('tip', 'reward', 'penalty', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure users table has points column (add if not exists)
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
-- RLS Policies for Groups
-- ========================================

-- Users can view all public groups
CREATE POLICY "Users can view all public groups" ON groups
  FOR SELECT USING (is_private = false OR created_by = auth.uid());

-- Users can view their own private groups
CREATE POLICY "Users can view their own private groups" ON groups
  FOR SELECT USING (created_by = auth.uid() AND is_private = true);

-- Users can create groups
CREATE POLICY "Users can create groups" ON groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own groups
CREATE POLICY "Users can update their own groups" ON groups
  FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own groups
CREATE POLICY "Users can delete their own groups" ON groups
  FOR DELETE USING (created_by = auth.uid());

-- ========================================
-- RLS Policies for Group Members
-- ========================================

-- Users can view group memberships
CREATE POLICY "Users can view group memberships" ON group_members
  FOR SELECT USING (group_id IN (SELECT id FROM groups WHERE is_private = false OR created_by = auth.uid()));

-- Users can join public groups
CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    group_id IN (SELECT id FROM groups WHERE is_private = false) AND 
    user_id = auth.uid()
  );

-- Group admins can manage memberships
CREATE POLICY "Group admins can manage memberships" ON group_members
  FOR ALL USING (
    group_id IN (
      SELECT id FROM groups 
      WHERE created_by = auth.uid() OR 
      id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin')
    )
  );

-- ========================================
-- RLS Policies for Conversations
-- ========================================

-- Users can view conversations they participate in
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Conversation participants can manage conversations
CREATE POLICY "Conversation participants can update conversations" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- RLS Policies for Conversation Participants
-- ========================================

-- Users can view conversation participants for conversations they're in
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Users can add themselves to conversations
CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own participant records
CREATE POLICY "Users can update their participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Users can leave conversations
CREATE POLICY "Users can leave conversations" ON conversation_participants
  FOR DELETE USING (user_id = auth.uid());

-- ========================================
-- RLS Policies for Messages
-- ========================================

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view conversation messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Users can send messages in conversations they participate in
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- ========================================
-- RLS Policies for Points Transactions
-- ========================================

-- Users can view their own point transactions
CREATE POLICY "Users can view their point transactions" ON points_transactions
  FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

-- Users can create point transactions as sender
CREATE POLICY "Users can send points" ON points_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ========================================
-- Indexes for Performance
-- ========================================

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_private ON groups(is_private);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);

-- Points transactions indexes
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_target_user ON points_transactions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);

-- ========================================
-- Functions and Triggers
-- ========================================

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_points(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points + amount 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement user points
CREATE OR REPLACE FUNCTION decrement_points(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET points = points - amount 
  WHERE id = user_id AND points >= amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ========================================
-- Sample Data (Optional - Uncomment for testing)
-- ========================================

/*
-- Sample public group
INSERT INTO groups (name, description, created_by, is_private) 
VALUES (
  'General Discussion',
  'A place for general community discussion and fellowship',
  (SELECT id FROM auth.users LIMIT 1),
  false
);

-- Sample private group
INSERT INTO groups (name, description, created_by, is_private) 
VALUES (
  'Prayer Team',
  'Private group for prayer requests and support',
  (SELECT id FROM auth.users LIMIT 1),
  true
);

-- Sample conversation
INSERT INTO conversations (type, created_by)
VALUES ('direct', (SELECT id FROM auth.users LIMIT 1));

-- Sample point transaction
INSERT INTO points_transactions (user_id, target_user_id, amount, transaction_type, description)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users OFFSET 1 LIMIT 1),
  10,
  'tip',
  'Great prayer request!'
);
*/

-- ========================================
-- Verification Queries
-- ========================================

-- Test the tables are working
SELECT 'Groups tables created successfully' as status;
SELECT 'Messaging tables created successfully' as status;
SELECT 'Points tables created successfully' as status;

-- Count tables
SELECT 
  'groups' as table_name,
  COUNT(*) as record_count
FROM groups
UNION ALL
SELECT 
  'group_members' as table_name,
  COUNT(*) as record_count
FROM group_members
UNION ALL
SELECT 
  'conversations' as table_name,
  COUNT(*) as record_count
FROM conversations
UNION ALL
SELECT 
  'conversation_participants' as table_name,
  COUNT(*) as record_count
FROM conversation_participants
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as record_count
FROM messages
UNION ALL
SELECT 
  'points_transactions' as table_name,
  COUNT(*) as record_count
FROM points_transactions;
