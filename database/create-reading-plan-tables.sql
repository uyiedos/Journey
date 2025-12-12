-- Reading Plan Tables for Journey App
-- These tables support progressive reading plan completion with status tracking

-- 1. Reading Plans Table
CREATE TABLE IF NOT EXISTS reading_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- Number of days
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    participant_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reading Plan Items (Daily readings)
CREATE TABLE IF NOT EXISTS reading_plan_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    title TEXT NOT NULL,
    passages TEXT[], -- Array of Bible passages
    devotional TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each day is unique per plan
    UNIQUE(plan_id, day)
);

-- 3. User Reading Plans (When a user starts a plan)
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

-- 4. Reading Plan Progress (Daily completion tracking)
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

-- 5. Reading Plan Streaks (For gamification)
CREATE TABLE IF NOT EXISTS reading_plan_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique streak per user and plan
    UNIQUE(user_id, plan_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reading_plans_public ON reading_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_reading_plans_created_at ON reading_plans(created_at);
CREATE INDEX IF NOT EXISTS idx_reading_plan_items_plan_id ON reading_plan_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_plans_user_id ON user_reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_plans_status ON user_reading_plans(status);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_user_plan ON reading_plan_progress(user_id, plan_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_completed ON reading_plan_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_reading_plan_streaks_user_plan ON reading_plan_streaks(user_id, plan_id);

-- Function to update plan status and current day automatically
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

-- Trigger to automatically update status
CREATE TRIGGER trigger_update_reading_plan_status
    AFTER UPDATE ON reading_plan_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_plan_status();

-- Function to update participant count when users start plans
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE reading_plans 
        SET participant_count = participant_count + 1
        WHERE id = NEW.plan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE reading_plans 
        SET participant_count = GREATEST(participant_count - 1, 0)
        WHERE id = OLD.plan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant count
CREATE TRIGGER trigger_update_participant_count
    AFTER INSERT OR DELETE ON user_reading_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_participant_count();
