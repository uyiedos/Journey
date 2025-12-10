-- Fix daily_login_rewards table structure
-- Run in Supabase SQL Editor

-- 1. Add missing columns to daily_login_rewards table
DO $$
BEGIN
    -- Add reward_date column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_login_rewards' 
        AND column_name = 'reward_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.daily_login_rewards 
        ADD COLUMN reward_date DATE NOT NULL DEFAULT NOW()::DATE;
        RAISE NOTICE 'Added reward_date column to daily_login_rewards';
    END IF;

    -- Add streak_day column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_login_rewards' 
        AND column_name = 'streak_day'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.daily_login_rewards 
        ADD COLUMN streak_day INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE 'Added streak_day column to daily_login_rewards';
    END IF;

    -- Add unique constraint if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'daily_login_rewards' 
        AND constraint_name = 'daily_login_rewards_user_id_reward_date_key'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.daily_login_rewards 
        ADD CONSTRAINT daily_login_rewards_user_id_reward_date_key 
        UNIQUE(user_id, reward_date);
        RAISE NOTICE 'Added unique constraint to daily_login_rewards';
    END IF;
END $$;

-- 2. Enable RLS if not enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'daily_login_rewards' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on daily_login_rewards';
    END IF;
END $$;

-- 3. Create RLS policies for daily_login_rewards
DROP POLICY IF EXISTS "Users can view own daily rewards" ON public.daily_login_rewards;
DROP POLICY IF EXISTS "Users can insert own daily rewards" ON public.daily_login_rewards;

CREATE POLICY "Users can view own daily rewards" ON public.daily_login_rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily rewards" ON public.daily_login_rewards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'daily_login_rewards' 
AND table_schema = 'public'
ORDER BY ordinal_position;
