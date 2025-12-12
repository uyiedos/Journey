-- ========================================
-- Create Groups Tables for Community
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

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies for Groups Table
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
-- RLS Policies for Group Members Table
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
-- Indexes for Performance
-- ========================================

-- Index for groups table
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_is_private ON groups(is_private);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at);

-- Index for group_members table
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- ========================================
-- Insert Sample Data (Optional)
-- ========================================

-- You can uncomment these lines to create sample groups for testing
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
*/

-- ========================================
-- Verification Queries
-- ========================================

-- Test the tables are working
SELECT 'Groups table created successfully' as status;
SELECT 'Group members table created successfully' as status;

-- Count tables
SELECT 
  'groups' as table_name,
  COUNT(*) as record_count
FROM groups
UNION ALL
SELECT 
  'group_members' as table_name,
  COUNT(*) as record_count
FROM group_members;
