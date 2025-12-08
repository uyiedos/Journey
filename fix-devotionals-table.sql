-- Fix devotionals table - add missing columns if they don't exist
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- Check if devotionals table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'devotionals') THEN
        
        -- Add author_name column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotionals' AND column_name = 'author_name') THEN
            ALTER TABLE devotionals ADD COLUMN author_name VARCHAR(255);
            RAISE NOTICE 'Added author_name column to devotionals table';
        END IF;
        
        -- Add other missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotionals' AND column_name = 'verse_reference') THEN
            ALTER TABLE devotionals ADD COLUMN verse_reference VARCHAR(255);
            RAISE NOTICE 'Added verse_reference column to devotionals table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotionals' AND column_name = 'verse_text') THEN
            ALTER TABLE devotionals ADD COLUMN verse_text TEXT;
            RAISE NOTICE 'Added verse_text column to devotionals table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotionals' AND column_name = 'tags') THEN
            ALTER TABLE devotionals ADD COLUMN tags TEXT[];
            RAISE NOTICE 'Added tags column to devotionals table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devotionals' AND column_name = 'is_public') THEN
            ALTER TABLE devotionals ADD COLUMN is_public BOOLEAN DEFAULT true;
            RAISE NOTICE 'Added is_public column to devotionals table';
        END IF;
        
        RAISE NOTICE 'Devotionals table columns verified/updated';
    ELSE
        RAISE NOTICE 'Devotionals table does not exist - run full migration first';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'devotionals' 
ORDER BY ordinal_position;
