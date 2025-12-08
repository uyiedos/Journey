-- Fix RLS policies for user profile updates and leaderboard

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Leaderboard policies" ON leaderboard;

-- Create user profile policies
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create leaderboard policies
CREATE POLICY "Users can view leaderboard" ON leaderboard
FOR SELECT USING (true); -- Public access to view leaderboard

CREATE POLICY "Users can update own leaderboard entry" ON leaderboard
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard entry" ON leaderboard
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on leaderboard if not already enabled
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
