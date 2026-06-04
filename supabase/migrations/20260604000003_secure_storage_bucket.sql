-- ============================================================
-- Migration: Secure Storage Bucket RLS Policies for Gallery
-- ============================================================

-- 1. Drop insecure policies
DROP POLICY IF EXISTS "Allow authenticated updates to gallery bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to gallery bucket" ON storage.objects;

-- 2. Create secure policies enforcing owner checks
CREATE POLICY "Allow authenticated updates to gallery bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery' AND owner = auth.uid())
WITH CHECK (bucket_id = 'gallery' AND owner = auth.uid());

CREATE POLICY "Allow authenticated deletes to gallery bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery' AND owner = auth.uid());
