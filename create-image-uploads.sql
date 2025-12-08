-- Create tables for image uploads and storage

-- Images table for storing uploaded files
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devotion images junction table
CREATE TABLE IF NOT EXISTS devotion_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotion_id UUID REFERENCES devotionals(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(devotion_id, image_id)
);

-- Reading plan images junction table
CREATE TABLE IF NOT EXISTS reading_plan_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, image_id)
);

-- Community post images junction table
CREATE TABLE IF NOT EXISTS post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, image_id)
);

-- User profile images (for avatar updates)
CREATE TABLE IF NOT EXISTS user_profile_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_devotion_images_devotion_id ON devotion_images(devotion_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_images_plan_id ON reading_plan_images(plan_id);
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_images_user_id ON user_profile_images(user_id);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotion_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Images policies
DROP POLICY IF EXISTS "Users can view own images" ON images;
CREATE POLICY "Users can view own images" ON images FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create own images" ON images;
CREATE POLICY "Users can create own images" ON images FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own images" ON images;
CREATE POLICY "Users can update own images" ON images FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own images" ON images;
CREATE POLICY "Users can delete own images" ON images FOR DELETE USING (auth.uid() = user_id);

-- Junction table policies
DROP POLICY IF EXISTS "Users can manage devotion images" ON devotion_images;
CREATE POLICY "Users can manage devotion images" ON devotion_images FOR ALL USING (
  EXISTS (SELECT 1 FROM devotionals WHERE id = devotion_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage reading plan images" ON reading_plan_images;
CREATE POLICY "Users can manage reading plan images" ON reading_plan_images FOR ALL USING (
  EXISTS (SELECT 1 FROM reading_plans WHERE id = plan_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage post images" ON post_images;
CREATE POLICY "Users can manage post images" ON post_images FOR ALL USING (
  EXISTS (SELECT 1 FROM community_posts WHERE id = post_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage profile images" ON user_profile_images;
CREATE POLICY "Users can manage profile images" ON user_profile_images FOR ALL USING (auth.uid() = user_id);

-- Add realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE images;
ALTER PUBLICATION supabase_realtime ADD TABLE devotion_images;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_plan_images;
ALTER PUBLICATION supabase_realtime ADD TABLE post_images;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profile_images;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
