-- Journey App - Real-time Database Migration Script
-- This script enhances existing tables and adds new features for admin, referrals, and point system

-- First, let's check if columns exist before adding them to avoid errors
DO $$
BEGIN
    -- Add role and admin privileges to users table (commented out for now)
    -- IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    --     ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner'));
    -- END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'daily_login_streak') THEN
        ALTER TABLE users ADD COLUMN daily_login_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_date') THEN
        ALTER TABLE users ADD COLUMN last_login_date DATE;
    END IF;
    
    -- Add username column to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
    END IF;
    
    -- Add referral_code column to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code VARCHAR(10) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'referred_by') THEN
        ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);
    END IF;
    
    -- Add notification preferences to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notification_preferences') THEN
        ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true, "admin_messages": true, "daily_reminders": true}';
    END IF;
    
    -- Add avatar column to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
    END IF;
    
    -- Add full_name column to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referred_id)
);

-- Create points_transactions table for detailed tracking
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('daily_login', 'referral', 'reading', 'devotional', 'prayer', 'community', 'achievement', 'admin_bonus')),
    points INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'announcement', 'maintenance', 'feature', 'spiritual')),
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'admins', 'users')),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_messages table for direct admin-to-user communication
CREATE TABLE IF NOT EXISTS user_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'announcement', 'warning', 'reward')),
    is_read BOOLEAN DEFAULT false,
    is_deleted_by_sender BOOLEAN DEFAULT false,
    is_deleted_by_recipient BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create daily_logins table for tracking daily login claims
CREATE TABLE IF NOT EXISTS daily_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 10,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);

-- Create daily_login_rewards table
CREATE TABLE IF NOT EXISTS daily_login_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 10,
    streak_multiplier INTEGER DEFAULT 1,
    bonus_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);

-- Create achievements table (if not exists)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points_reward INTEGER DEFAULT 0,
    category VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(user_id, achievement_id)
);

-- Create devotionals table
CREATE TABLE IF NOT EXISTS devotionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    verse_reference VARCHAR(255),
    verse_text TEXT,
    author_name VARCHAR(255),
    tags TEXT[],
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_plans table
CREATE TABLE IF NOT EXISTS reading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in days
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(50),
    verses_per_day INTEGER DEFAULT 3,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reading_plan_progress table
CREATE TABLE IF NOT EXISTS reading_plan_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    verses_read TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, plan_id, day_number)
);

-- Create user_reading_plans table (for tracking user's active plans)
CREATE TABLE IF NOT EXISTS user_reading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_day INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, plan_id)
);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    verse_reference VARCHAR(255),
    verse_text TEXT,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'verse', 'prayer')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table for admin announcements
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(500),
    author_id UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing user_stats table with new columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'last_activity_at') THEN
        ALTER TABLE user_stats ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'total_points_earned') THEN
        ALTER TABLE user_stats ADD COLUMN total_points_earned INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'referrals_completed') THEN
        ALTER TABLE user_stats ADD COLUMN referrals_completed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'daily_challenges_completed') THEN
        ALTER TABLE user_stats ADD COLUMN daily_challenges_completed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient_id ON user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_user_id ON daily_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logins_login_date ON daily_logins(login_date);
CREATE INDEX IF NOT EXISTS idx_devotionals_user_id ON devotionals(user_id);
CREATE INDEX IF NOT EXISTS idx_devotionals_created_at ON devotionals(created_at);
CREATE INDEX IF NOT EXISTS idx_devotionals_is_public ON devotionals(is_public);
CREATE INDEX IF NOT EXISTS idx_reading_plans_user_id ON reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plans_is_public ON reading_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_user_reading_plans_user_id ON user_reading_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_user_id ON reading_plan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_user_id ON daily_login_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_login_rewards_login_date ON daily_login_rewards(login_date);

-- Enable Real-time for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE points_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE user_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_logins;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_login_rewards;
ALTER PUBLICATION supabase_realtime ADD TABLE devotionals;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE user_reading_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_plan_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE news;

-- Row Level Security (RLS) Policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Referrals table policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Points transactions policies
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON points_transactions;
CREATE POLICY "Users can view own transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can create transactions" ON points_transactions;
CREATE POLICY "System can create transactions" ON points_transactions FOR INSERT WITH CHECK (true);

-- Admin notifications policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "All can view active notifications" ON admin_notifications;
CREATE POLICY "All can view active notifications" ON admin_notifications FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage notifications" ON admin_notifications;
CREATE POLICY "Admins can manage notifications" ON admin_notifications FOR ALL USING (true); -- Simplified for now

-- User messages policies
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON user_messages;
CREATE POLICY "Users can view own messages" ON user_messages FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can send messages" ON user_messages;
CREATE POLICY "Users can send messages" ON user_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can update own messages" ON user_messages;
CREATE POLICY "Users can update own messages" ON user_messages FOR UPDATE USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- Daily login rewards policies
ALTER TABLE daily_login_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own rewards" ON daily_login_rewards;
CREATE POLICY "Users can view own rewards" ON daily_login_rewards FOR SELECT USING (auth.uid() = user_id);

-- Daily logins policies
ALTER TABLE daily_logins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own logins" ON daily_logins;
CREATE POLICY "Users can view own logins" ON daily_logins FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own logins" ON daily_logins;
CREATE POLICY "Users can create own logins" ON daily_logins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Devotionals policies
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own devotionals" ON devotionals;
CREATE POLICY "Users can view own devotionals" ON devotionals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own devotionals" ON devotionals;
CREATE POLICY "Users can create own devotionals" ON devotionals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own devotionals" ON devotionals;
CREATE POLICY "Users can update own devotionals" ON devotionals FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "All can view public devotionals" ON devotionals;
CREATE POLICY "All can view public devotionals" ON devotionals FOR SELECT USING (is_public = true);

-- Reading plans policies
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own reading plans" ON reading_plans;
CREATE POLICY "Users can view own reading plans" ON reading_plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own reading plans" ON reading_plans;
CREATE POLICY "Users can create own reading plans" ON reading_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reading plans" ON reading_plans;
CREATE POLICY "Users can update own reading plans" ON reading_plans FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "All can view public reading plans" ON reading_plans;
CREATE POLICY "All can view public reading plans" ON reading_plans FOR SELECT USING (is_public = true);

-- User reading plans policies
ALTER TABLE user_reading_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user reading plans" ON user_reading_plans;
CREATE POLICY "Users can view own user reading plans" ON user_reading_plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own user reading plans" ON user_reading_plans;
CREATE POLICY "Users can create own user reading plans" ON user_reading_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own user reading plans" ON user_reading_plans;
CREATE POLICY "Users can update own user reading plans" ON user_reading_plans FOR UPDATE USING (auth.uid() = user_id);

-- Reading plan progress policies
ALTER TABLE reading_plan_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own reading plan progress" ON reading_plan_progress;
CREATE POLICY "Users can view own reading plan progress" ON reading_plan_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own reading plan progress" ON reading_plan_progress;
CREATE POLICY "Users can create own reading plan progress" ON reading_plan_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reading plan progress" ON reading_plan_progress;
CREATE POLICY "Users can update own reading plan progress" ON reading_plan_progress FOR UPDATE USING (auth.uid() = user_id);

-- News policies
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "All can view published news" ON news;
CREATE POLICY "All can view published news" ON news FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (true); -- Simplified for now

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points_reward, category, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first devotional reading', 'book-open', 50, 'reading', 'devotionals_read', 1),
('Daily Devotion', 'Read devotionals for 7 consecutive days', 'calendar', 100, 'reading', 'daily_streak', 7),
('Bible Scholar', 'Read 100 verses total', 'award', 200, 'reading', 'verses_read', 100),
('Prayer Warrior', 'Share 10 prayers with the community', 'heart', 150, 'community', 'prayers_shared', 10),
('Community Builder', 'Make 5 friends', 'users', 100, 'community', 'friends_count', 5),
('Referral Champion', 'Refer 3 new users', 'gift', 300, 'referral', 'referrals_completed', 3),
('Point Master', 'Earn 1000 points', 'star', 500, 'points', 'total_points', 1000),
('Level Up', 'Reach level 10', 'trophy', 1000, 'level', 'level', 10)
ON CONFLICT DO NOTHING;

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text), 1, 8));
        SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating referral codes
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON users;
CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_code();

-- Create function for awarding daily login points
CREATE OR REPLACE FUNCTION award_daily_login_points(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    last_login DATE;
    streak INTEGER := 1;
    points INTEGER := 10;
    multiplier INTEGER := 1;
BEGIN
    -- Get user's last login date and current streak
    SELECT last_login_date, daily_login_streak INTO last_login, streak
    FROM users WHERE id = user_uuid;
    
    -- Calculate streak
    IF last_login = today - INTERVAL '1 day' THEN
        streak := streak + 1;
    ELSIF last_login < today - INTERVAL '1 day' OR last_login IS NULL THEN
        streak := 1;
    END IF;
    
    -- Calculate multiplier based on streak
    IF streak >= 30 THEN
        multiplier := 3;
    ELSIF streak >= 14 THEN
        multiplier := 2;
    ELSIF streak >= 7 THEN
        multiplier := 1.5;
    ELSE
        multiplier := 1;
    END IF;
    
    points := 10 * multiplier;
    
    -- Update user's login info
    UPDATE users 
    SET 
        last_login_at = NOW(),
        last_login_date = today,
        daily_login_streak = streak
    WHERE id = user_uuid;
    
    -- Insert daily login reward
    INSERT INTO daily_login_rewards (user_id, login_date, points_awarded, streak_multiplier, bonus_points)
    VALUES (user_uuid, today, points, multiplier, 0)
    ON CONFLICT (user_id, login_date) DO NOTHING;
    
    -- Add points transaction
    INSERT INTO points_transactions (user_id, transaction_type, points, description, metadata)
    VALUES (user_uuid, 'daily_login', points, 'Daily login reward', json_build_object('streak', streak, 'multiplier', multiplier));
    
    -- Update user stats
    UPDATE user_stats 
    SET total_points_earned = total_points_earned + points,
        last_activity_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Update user points
    UPDATE users 
    SET points = points + points
    WHERE id = user_uuid;
    
    RETURN points;
END;
$$ LANGUAGE plpgsql;

-- Create function for processing referrals
CREATE OR REPLACE FUNCTION process_referral(referrer_uuid UUID, referred_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    referral_points INTEGER := 100;
BEGIN
    -- Create referral record
    INSERT INTO referrals (referrer_id, referred_id, referral_code, status, points_awarded)
    SELECT referrer_uuid, referred_uuid, referral_code, 'completed', referral_points
    FROM users WHERE id = referrer_uuid;
    
    -- Award points to referrer
    INSERT INTO points_transactions (user_id, transaction_type, points, description, metadata)
    VALUES (referrer_uuid, 'referral', referral_points, 'Referral bonus', json_build_object('referred_user', referred_uuid));
    
    UPDATE users SET points = points + referral_points WHERE id = referrer_uuid;
    UPDATE user_stats SET 
        referrals_completed = referrals_completed + 1,
        total_points_earned = total_points_earned + referral_points
    WHERE user_id = referrer_uuid;
    
    -- Award welcome points to new user
    INSERT INTO points_transactions (user_id, transaction_type, points, description, metadata)
    VALUES (referred_uuid, 'referral', 50, 'Welcome bonus', json_build_object('referred_by', referrer_uuid));
    
    UPDATE users SET points = points + 50 WHERE id = referred_uuid;
    UPDATE user_stats SET total_points_earned = total_points_earned + 50 WHERE user_id = referred_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to set first user as owner
CREATE OR REPLACE FUNCTION set_first_user_as_owner()
RETURNS VOID AS $$
BEGIN
    -- Commented out for now - role column management to be added later
    -- UPDATE users 
    -- SET role = 'owner' 
    -- WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Set the first user as owner (run this after your first signup)
-- SELECT set_first_user_as_owner();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatar storage
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Users can view their own avatar"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Public can view all avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Create function to auto-generate referral code from username
CREATE OR REPLACE FUNCTION generate_referral_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- If referral_code is not set, generate it from username
    IF NEW.referral_code IS NULL AND NEW.username IS NOT NULL THEN
        -- Clean username: remove special characters, make lowercase, ensure uniqueness
        NEW.referral_code := LOWER(REGEXP_REPLACE(NEW.username, '[^a-zA-Z0-9]', '', 'g'));
        
        -- Ensure uniqueness by adding random suffix if needed
        WHILE EXISTS (SELECT 1 FROM users WHERE referral_code = NEW.referral_code AND id != NEW.id) LOOP
            NEW.referral_code := LOWER(REGEXP_REPLACE(NEW.username, '[^a-zA-Z0-9]', '', 'g')) || '_' || substr(md5(random()::text), 1, 4);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate referral code on user insert/update
CREATE TRIGGER auto_generate_referral_code
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code_trigger();

-- Update existing users to have usernames based on email
UPDATE users 
SET username = LOWER(REGEXP_REPLACE(COALESCE(email, 'user'), '[^a-zA-Z0-9]', '', 'g')) 
WHERE username IS NULL;

-- Update existing users to have referral codes based on usernames
UPDATE users 
SET referral_code = LOWER(REGEXP_REPLACE(COALESCE(username, email), '[^a-zA-Z0-9]', '', 'g'))
WHERE referral_code IS NULL;

-- Handle any conflicts by adding random suffix
UPDATE users 
SET referral_code = referral_code || '_' || substr(md5(random()::text), 1, 4)
WHERE id IN (
    SELECT u1.id 
    FROM users u1
    JOIN users u2 ON u1.referral_code = u2.referral_code AND u1.id != u2.id
);
