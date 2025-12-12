-- Create events table for storing community events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'video' NOT NULL,
  video_url TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- Enable RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- Allow authenticated users to read all events
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to create events
CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Allow users to update their own events
CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Allow users to delete their own events
CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Create event likes table
CREATE TABLE IF NOT EXISTS public.event_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for event_likes
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for event_likes
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their event likes" ON public.event_likes;

CREATE POLICY "Users can manage their event likes" ON public.event_likes
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Create event comments table
CREATE TABLE IF NOT EXISTS public.event_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for event_comments
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for event_comments
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all event comments" ON public.event_comments;
DROP POLICY IF EXISTS "Users can create event comments" ON public.event_comments;
DROP POLICY IF EXISTS "Users can update own event comments" ON public.event_comments;
DROP POLICY IF EXISTS "Users can delete own event comments" ON public.event_comments;

CREATE POLICY "Users can view all event comments" ON public.event_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create event comments" ON public.event_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own event comments" ON public.event_comments
  FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete own event comments" ON public.event_comments
  FOR DELETE USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Create indexes for comments and likes
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON public.event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user_id ON public.event_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON public.event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON public.event_likes(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON public.events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for event_comments table
DROP TRIGGER IF EXISTS update_event_comments_updated_at ON public.event_comments;
CREATE TRIGGER update_event_comments_updated_at 
  BEFORE UPDATE ON public.event_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
