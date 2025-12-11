-- Fix Avatar Storage RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Create avatars bucket if it doesn't exist
DO $$
BEGIN
    -- Check if bucket exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars' AND name = 'avatars') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'avatars', 
            'avatars', 
            true, 
            5242880, -- 5MB limit
            ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        );
        RAISE NOTICE 'Avatars bucket created';
    ELSE
        RAISE NOTICE 'Avatars bucket already exists';
    END IF;
END $$;

-- 2. Drop ALL existing avatar-related policies first
DO $$
BEGIN
    -- Drop policies one by one to avoid conflicts
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view all avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar insert policy" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar select policy" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
    DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;
    
    RAISE NOTICE 'Dropped existing avatar policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- 3. Create new policies for storage objects
DO $$
BEGIN
    -- Check if bucket exists before creating policies
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars' AND name = 'avatars') THEN
        
        -- Policy for users to upload their own avatar
        CREATE POLICY "Users can upload their own avatar" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
        -- Policy for users to update their own avatar
        CREATE POLICY "Users can update their own avatar" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
        -- Policy for users to view their own avatar
        CREATE POLICY "Users can view their own avatar" ON storage.objects
        FOR SELECT USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
        
        -- Policy for public to view all avatars (since avatars are public)
        CREATE POLICY "Public can view all avatars" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
        
        RAISE NOTICE 'Avatar storage policies created successfully';
    ELSE
        RAISE NOTICE 'Cannot create policies: avatars bucket does not exist';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- 4. Grant necessary permissions on storage
DO $$
BEGIN
    -- Grant permissions on storage schema
    GRANT USAGE ON SCHEMA storage TO authenticated;
    GRANT USAGE ON SCHEMA storage TO anon;
    
    -- Grant permissions on storage objects
    GRANT ALL ON storage.objects TO authenticated;
    GRANT SELECT ON storage.objects TO anon;
    
    RAISE NOTICE 'Storage permissions granted';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END $$;

-- 5. Verify policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- 6. Test query to verify bucket access
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';
