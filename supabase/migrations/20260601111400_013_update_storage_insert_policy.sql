-- Update the product-images INSERT policy with explicit auth role check
DROP POLICY IF EXISTS "product-images insert" ON storage.objects;

CREATE POLICY "product-images insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text));
