-- Enhanced Bible Features Migration
-- Adds bookmarks, highlights, and verse sharing capabilities

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bible_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_end INTEGER, -- For verse ranges
    title TEXT,
    notes TEXT,
    category VARCHAR(50) DEFAULT 'general',
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for highlight
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter, verse_end)
);

-- Create verse highlights table
CREATE TABLE IF NOT EXISTS bible_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_end INTEGER, -- For verse ranges
    text_content TEXT NOT NULL,
    highlight_color VARCHAR(7) DEFAULT '#FBBF24', -- Default yellow
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter, verse_end)
);

-- Create reading progress table
CREATE TABLE IF NOT EXISTS bible_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    chapters_completed INTEGER[] DEFAULT '{}', -- Array of completed chapter numbers
    current_chapter INTEGER DEFAULT 1,
    last_read_chapter INTEGER,
    last_read_verse INTEGER,
    reading_streak INTEGER DEFAULT 0,
    total_verses_read INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Create verse notes table
CREATE TABLE IF NOT EXISTS bible_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    verse_end INTEGER,
    note_content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shared verses table
CREATE TABLE IF NOT EXISTS shared_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER,
    share_text TEXT NOT NULL,
    reflection TEXT,
    is_public BOOLEAN DEFAULT false,
    share_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_reference ON bible_bookmarks(book_id, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_category ON bible_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_favorite ON bible_bookmarks(is_favorite);

CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_id ON bible_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_reference ON bible_highlights(book_id, chapter, verse);

CREATE INDEX IF NOT EXISTS idx_bible_reading_progress_user_id ON bible_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_reading_progress_book_id ON bible_reading_progress(book_id);

CREATE INDEX IF NOT EXISTS idx_bible_notes_user_id ON bible_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_notes_reference ON bible_notes(book_id, chapter, verse);

CREATE INDEX IF NOT EXISTS idx_shared_verses_user_id ON shared_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_verses_public ON shared_verses(is_public);
CREATE INDEX IF NOT EXISTS idx_shared_verses_created ON shared_verses(created_at DESC);

-- Enable RLS
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_verses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bible_bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bible_bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bible_bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON bible_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookmarks" ON bible_bookmarks;
CREATE POLICY "Users can update own bookmarks" ON bible_bookmarks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bible_bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON bible_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for highlights
DROP POLICY IF EXISTS "Users can view own highlights" ON bible_highlights;
CREATE POLICY "Users can view own highlights" ON bible_highlights FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own highlights" ON bible_highlights;
CREATE POLICY "Users can insert own highlights" ON bible_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own highlights" ON bible_highlights;
CREATE POLICY "Users can update own highlights" ON bible_highlights FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own highlights" ON bible_highlights;
CREATE POLICY "Users can delete own highlights" ON bible_highlights FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reading progress
DROP POLICY IF EXISTS "Users can view own reading progress" ON bible_reading_progress;
CREATE POLICY "Users can view own reading progress" ON bible_reading_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own reading progress" ON bible_reading_progress;
CREATE POLICY "Users can manage own reading progress" ON bible_reading_progress FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notes
DROP POLICY IF EXISTS "Users can view own notes" ON bible_notes;
CREATE POLICY "Users can view own notes" ON bible_notes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notes" ON bible_notes;
CREATE POLICY "Users can manage own notes" ON bible_notes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for shared verses
DROP POLICY IF EXISTS "Users can view own shared verses" ON shared_verses;
CREATE POLICY "Users can view own shared verses" ON shared_verses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view public shared verses" ON shared_verses;
CREATE POLICY "Anyone can view public shared verses" ON shared_verses FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert own shared verses" ON shared_verses;
CREATE POLICY "Users can insert own shared verses" ON shared_verses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own shared verses" ON shared_verses;
CREATE POLICY "Users can update own shared verses" ON shared_verses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own shared verses" ON shared_verses;
CREATE POLICY "Users can delete own shared verses" ON shared_verses FOR DELETE USING (auth.uid() = user_id);

-- Function to update reading progress
CREATE OR REPLACE FUNCTION update_reading_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert reading progress
    INSERT INTO bible_reading_progress (
        user_id, 
        book_id, 
        last_read_chapter, 
        last_read_verse, 
        total_verses_read,
        updated_at
    )
    VALUES (
        auth.uid(),
        NEW.book_id,
        NEW.chapter,
        NEW.verse,
        1,
        NOW()
    )
    ON CONFLICT (user_id, book_id)
    DO UPDATE SET
        last_read_chapter = NEW.chapter,
        last_read_verse = NEW.verse,
        total_verses_read = bible_reading_progress.total_verses_read + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic reading progress tracking
DROP TRIGGER IF EXISTS auto_update_reading_progress ON bible_highlights;
CREATE TRIGGER auto_update_reading_progress
    AFTER INSERT ON bible_highlights
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_progress();

-- Insert default bookmark categories
DO $$
BEGIN
    -- This would typically be handled by the application
    -- But we can create a reference table if needed
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON bible_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bible_highlights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bible_reading_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bible_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_verses TO authenticated;

GRANT SELECT ON shared_verses TO anon; -- Allow public viewing of shared verses

-- Verify table structures
SELECT 'bible_bookmarks' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bible_bookmarks' 
ORDER BY ordinal_position;

SELECT 'bible_highlights' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bible_highlights' 
ORDER BY ordinal_position;

SELECT 'shared_verses' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shared_verses' 
ORDER BY ordinal_position;
