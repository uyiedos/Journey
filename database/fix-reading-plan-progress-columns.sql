-- Fix missing columns in reading_plan_progress table

-- Add day column if it doesn't exist
ALTER TABLE reading_plan_progress 
ADD COLUMN IF NOT EXISTS day INTEGER NOT NULL DEFAULT 1;

-- Add other missing columns if they don't exist
ALTER TABLE reading_plan_progress 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE reading_plan_progress 
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Update existing records to have proper day values
UPDATE reading_plan_progress 
SET day = 1 
WHERE day IS NULL;

-- Ensure unique constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reading_plan_progress_user_plan_day_unique'
    ) THEN
        ALTER TABLE reading_plan_progress 
        ADD CONSTRAINT reading_plan_progress_user_plan_day_unique 
        UNIQUE(user_id, plan_id, day);
    END IF;
END $$;

-- Check if table exists and has the right structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'reading_plan_progress' 
ORDER BY ordinal_position;
