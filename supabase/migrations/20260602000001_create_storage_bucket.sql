-- ============================================================
-- Migration: Create Storage Bucket and RLS Policies for Gallery
-- ============================================================

-- 1. Create the gallery bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery',
    'gallery',
    true,
    10485760, -- 10MB in bytes
    ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove the old redundant wednity bucket if it exists
DELETE FROM storage.buckets WHERE id = 'wednity';

-- 3. Ensure RLS is enabled
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read access to wednity bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated inserts to wednity bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to wednity bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to wednity bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select on buckets" ON storage.buckets;

DROP POLICY IF EXISTS "Allow public read access to gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated inserts to gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to gallery bucket" ON storage.objects;

-- 5. Create policies for storage.objects in gallery bucket
CREATE POLICY "Allow public read access to gallery bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated inserts to gallery bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated updates to gallery bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated deletes to gallery bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');

-- 6. Create policies for storage.buckets
CREATE POLICY "Allow public select on buckets"
ON storage.buckets FOR SELECT
TO public
USING (true);
