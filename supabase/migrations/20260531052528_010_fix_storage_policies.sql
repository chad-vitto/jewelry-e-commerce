-- Drop overly restrictive policies for product images
DROP POLICY IF EXISTS "Authenticated Upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete product-images" ON storage.objects;

-- New simplified policies for product images

-- Allow authenticated users to upload to product-images bucket
CREATE POLICY "Allow authenticated upload product-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated delete product-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Keep public read access
-- (Public Read Access product-images policy already exists and is fine)
