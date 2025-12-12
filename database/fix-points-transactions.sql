-- ========================================
-- Fix Points Transactions Table
-- ========================================

-- Drop existing table if it exists with wrong schema
DROP TABLE IF EXISTS points_transactions CASCADE;

-- Create points_transactions table with correct schema
CREATE TABLE points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'tip' CHECK (transaction_type IN ('tip', 'reward', 'penalty', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their point transactions" ON points_transactions
  FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can send points" ON points_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX idx_points_transactions_target_user ON points_transactions(target_user_id);
CREATE INDEX idx_points_transactions_created_at ON points_transactions(created_at);

-- Verification
SELECT 'Points transactions table fixed successfully' as status;
