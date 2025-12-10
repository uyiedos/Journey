-- Verify and fix users table structure
-- Run in Supabase SQL Editor

-- 1. Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
DO $$
BEGIN
    -- Add points column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'points'
    ) THEN
        ALTER TABLE public.users ADD COLUMN points INTEGER DEFAULT 0;
        RAISE NOTICE 'Added points column';
    END IF;

    -- Add level column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'level'
    ) THEN
        ALTER TABLE public.users ADD COLUMN level INTEGER DEFAULT 1;
        RAISE NOTICE 'Added level column';
    END IF;

    -- Add streak column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'streak'
    ) THEN
        ALTER TABLE public.users ADD COLUMN streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Added streak column';
    END IF;

    -- Add longest_streak column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'longest_streak'
    ) THEN
        ALTER TABLE public.users ADD COLUMN longest_streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Added longest_streak column';
    END IF;

    -- Add last_daily_claim column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'last_daily_claim'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_daily_claim TIMESTAMPTZ;
        RAISE NOTICE 'Added last_daily_claim column';
    END IF;

    -- Add updated_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- 3. Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
