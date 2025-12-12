-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create friend requests table without foreign keys
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

-- Step 2: Create friendships table without foreign keys
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Step 3: Create indexes (no foreign keys yet)
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);

-- Step 4: Add foreign key constraints one by one to isolate the error
-- Add sender foreign key
ALTER TABLE public.friend_requests 
  ADD CONSTRAINT fk_friend_requests_sender 
  FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add receiver foreign key
ALTER TABLE public.friend_requests 
  ADD CONSTRAINT fk_friend_requests_receiver 
  FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add friendships foreign keys
ALTER TABLE public.friendships 
  ADD CONSTRAINT fk_friendships_user 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.friendships 
  ADD CONSTRAINT fk_friendships_friend 
  FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;
