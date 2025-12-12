-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create friend requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create friendships table for accepted requests
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Add foreign key constraints after tables are created
ALTER TABLE public.friend_requests 
  ADD CONSTRAINT fk_friend_requests_sender 
  FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.friend_requests 
  ADD CONSTRAINT fk_friend_requests_receiver 
  FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.friendships 
  ADD CONSTRAINT fk_friendships_user 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.friendships 
  ADD CONSTRAINT fk_friendships_friend 
  FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable RLS (Row Level Security)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Simple policies - just check authentication
CREATE POLICY "friend_requests_select" ON public.friend_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "friend_requests_insert" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "friend_requests_update" ON public.friend_requests
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "friend_requests_delete" ON public.friend_requests
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "friendships_select" ON public.friendships
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "friendships_insert" ON public.friendships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "friendships_delete" ON public.friendships
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
