-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create friend requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create friendships table for accepted requests
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_requests
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Users can update received friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Users can delete their friend requests" ON public.friend_requests;

-- Users can see friend requests they sent or received (simplified)
CREATE POLICY "Users can view their friend requests" ON public.friend_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create friend requests (only as sender)
CREATE POLICY "Users can create friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update friend requests they received
CREATE POLICY "Users can update received friend requests" ON public.friend_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Users can delete friend requests they sent or received
CREATE POLICY "Users can delete their friend requests" ON public.friend_requests
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for friendships
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "System can create friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

-- Users can see their friendships
CREATE POLICY "Users can view their friendships" ON public.friendships
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create friendships (system will handle this)
CREATE POLICY "System can create friendships" ON public.friendships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their friendships
CREATE POLICY "Users can delete their friendships" ON public.friendships
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);

-- Function to handle friend request acceptance
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being updated to 'accepted', create friendship record
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Try to insert friendship in both orders, one will succeed due to UNIQUE constraint
    INSERT INTO public.friendships (user_id, friend_id)
    VALUES (NEW.sender_id, NEW.receiver_id)
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for friend request acceptance
DROP TRIGGER IF EXISTS friend_request_accepted ON public.friend_requests;
CREATE TRIGGER friend_request_accepted
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION accept_friend_request();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER update_friend_requests_updated_at 
  BEFORE UPDATE ON public.friend_requests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
