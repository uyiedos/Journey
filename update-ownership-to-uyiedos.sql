-- Update all devotions and posts to be owned by 'uyiedos'
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    uyiedos_id UUID;
    uyiedos_username TEXT := 'uyiedos';
    uyiedos_email TEXT := 'uyiedos@example.com';
    uyiedos_avatar TEXT := 'https://ui-avatars.com/api/?name=Uyiedos&background=random';
BEGIN
    -- Check if users table exists and get uyiedos user ID or create it
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Try to get existing uyiedos user
        SELECT id INTO uyiedos_id FROM auth.users WHERE email = uyiedos_email LIMIT 1;
        
        -- If uyiedos user doesn't exist, create it
        IF uyiedos_id IS NULL THEN
            -- Insert into auth.users (this is a simplified example, in production you'd use proper auth flow)
            -- Note: This is a placeholder - in a real scenario, you'd need to use the proper auth flow to create a user
            -- with a hashed password and proper auth configuration
            RAISE NOTICE 'User uyiedos@example.com does not exist. Please create this user first using the authentication system.';
            RETURN;
        END IF;
        
        -- Update all devotionals to be owned by uyiedos
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'devotionals') THEN
            UPDATE devotionals 
            SET 
                author_id = uyiedos_id,
                author_name = uyiedos_username
            WHERE author_id != uyiedos_id OR author_name != uyiedos_username;
            
            RAISE NOTICE 'Updated % devotionals to be owned by %', ROW_COUNT, uyiedos_username;
        END IF;
        
        -- Update all community posts to be owned by uyiedos
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'community_posts') THEN
            -- First, ensure the user_id column exists
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'user_id') THEN
                UPDATE community_posts 
                SET user_id = uyiedos_id
                WHERE user_id != uyiedos_id;
                
                RAISE NOTICE 'Updated % community posts to be owned by %', ROW_COUNT, uyiedos_username;
            END IF;
            
            -- Also update author_name if the column exists
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'author_name') THEN
                UPDATE community_posts 
                SET author_name = uyiedos_username
                WHERE author_name != uyiedos_username;
                
                RAISE NOTICE 'Updated author_name for % community posts to %', ROW_COUNT, uyiedos_username;
            END IF;
        END IF;
        
        -- Update any other tables that might have ownership
        -- Add more tables as needed
        
        RAISE NOTICE 'Ownership update completed successfully.';
    ELSE
        RAISE NOTICE 'Users table does not exist. Cannot update ownership.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'An error occurred: %', SQLERRM;
END $$;
