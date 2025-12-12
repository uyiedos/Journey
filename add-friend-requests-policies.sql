-- Enable RLS (Row Level Security)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "friend_requests_select" ON public.friend_requests;
DROP POLICY IF EXISTS "friend_requests_insert" ON public.friend_requests;
DROP POLICY IF EXISTS "friend_requests_update" ON public.friend_requests;
DROP POLICY IF EXISTS "friend_requests_delete" ON public.friend_requests;

DROP POLICY IF EXISTS "friendships_select" ON public.friendships;
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
DROP POLICY IF EXISTS "friendships_delete" ON public.friendships;

-- Create simple policies - just check if user is authenticated
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
