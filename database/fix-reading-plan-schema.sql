-- Comprehensive fix for reading plan schema issues

-- Drop and recreate reading_plan_progress table if it has wrong structure
DROP TABLE IF EXISTS reading_plan_progress CASCADE;

-- Recreate reading_plan_progress table with correct structure
CREATE TABLE IF NOT EXISTS reading_plan_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique progress per user, plan, and day
    UNIQUE(user_id, plan_id, day)
);

-- Drop and recreate user_reading_plans table if needed
DROP TABLE IF EXISTS user_reading_plans CASCADE;

-- Recreate user_reading_plans table with correct structure
CREATE TABLE IF NOT EXISTS user_reading_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    current_day INTEGER NOT NULL DEFAULT 1,
    total_days INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate plans per user
    UNIQUE(user_id, plan_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_user_plan ON reading_plan_progress(user_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_completed ON reading_plan_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_reading_plans_user_id ON user_reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_plans_status ON user_reading_plans(status);

-- Recreate the trigger function for automatic status updates
CREATE OR REPLACE FUNCTION update_reading_plan_status()
RETURNS TRIGGER AS $$
BEGIN
    -- When a day is completed, update the user's current day and potentially status
    IF TG_OP = 'UPDATE' AND NEW.completed = TRUE AND OLD.completed = FALSE THEN
        -- Update current day to next day if not completed
        UPDATE user_reading_plans 
        SET 
            current_day = LEAST(current_day + 1, total_days),
            updated_at = NOW()
        WHERE user_id = NEW.user_id AND plan_id = NEW.plan_id;
        
        -- Check if plan is completed
        UPDATE user_reading_plans 
        SET 
            status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND plan_id = NEW.plan_id 
          AND current_day >= total_days;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_reading_plan_status ON reading_plan_progress;
CREATE TRIGGER trigger_update_reading_plan_status
    AFTER UPDATE ON reading_plan_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_plan_status();

-- Verify table structures
SELECT 'reading_plan_progress' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'reading_plan_progress' 
ORDER BY ordinal_position;

SELECT 'user_reading_plans' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_reading_plans' 
ORDER BY ordinal_position;
