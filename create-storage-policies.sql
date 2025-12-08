-- Create storage policies for the images bucket

-- Policy to allow users to upload images to their own folder
CREATE POLICY "Users can upload images to own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to read their own images
CREATE POLICY "Users can read own images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow public access to public images
CREATE POLICY "Public images are publicly accessible" ON storage.objects
FOR SELECT USING (
  bucket_id = 'images' AND 
  (storage.foldername(name))[1] = 'public'
);

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON SCHEMA storage TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon;
