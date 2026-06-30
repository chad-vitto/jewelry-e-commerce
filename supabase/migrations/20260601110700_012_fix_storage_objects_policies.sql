-- Drop old incorrect policies on storage.objects if they exist
DROP POLICY IF EXISTS "Allow authenticated upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete product-images" ON storage.objects;

-- Create correct policies on storage.objects table for product-images bucket

-- Allow authenticated users to upload into product-images bucket
CREATE POLICY "product-images insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to view objects in product-images bucket
CREATE POLICY "product-images select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to update objects in product-images bucket
CREATE POLICY "product-images update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete objects in product-images bucket
CREATE POLICY "product-images delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
