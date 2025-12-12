-- Fix missing status column in user_reading_plans table

-- Add status column if it doesn't exist
ALTER TABLE user_reading_plans 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started';

-- Add check constraint for status values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_reading_plans_status_check'
    ) THEN
        ALTER TABLE user_reading_plans 
        ADD CONSTRAINT user_reading_plans_status_check 
        CHECK (status IN ('not_started', 'in_progress', 'completed'));
    END IF;
END $$;

-- Update any existing records to have proper status
UPDATE user_reading_plans 
SET status = 'in_progress' 
WHERE started_at IS NOT NULL AND completed_at IS NULL AND status IS NULL;

UPDATE user_reading_plans 
SET status = 'completed' 
WHERE completed_at IS NOT NULL AND status IS NULL;

-- Ensure status is set for all existing records
UPDATE user_reading_plans 
SET status = 'not_started'
WHERE status IS NULL;
