-- Add readings column to reading_plans table
-- This will store the detailed daily readings as JSON

-- Add the readings column as JSONB
ALTER TABLE reading_plans 
ADD COLUMN IF NOT EXISTS readings JSONB DEFAULT '[]'::jsonb;

-- Create an index on the readings column for better query performance
CREATE INDEX IF NOT EXISTS idx_reading_plans_readings ON reading_plans USING GIN(readings);

-- Update existing reading plans to have basic readings structure
-- This is a fallback for plans created without detailed readings
UPDATE reading_plans 
SET readings = jsonb_build_array(
    jsonb_build_object(
        'id', gen_random_uuid(),
        'day', 1,
        'title', 'Day 1',
        'passages', jsonb_build_array('John 3:16'),
        'devotional', 'Read and reflect on this powerful verse about God''s love.',
        'completed', false
    )
)
WHERE readings = '[]'::jsonb AND duration >= 1;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'reading_plans' AND column_name = 'readings';

-- Show a sample of the updated structure
SELECT id, title, duration, jsonb_pretty(readings) as readings_structure
FROM reading_plans 
LIMIT 3;
