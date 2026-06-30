-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, owner)
VALUES 
  ('product-images', 'product-images', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access product-images'
  ) THEN
    CREATE POLICY "Public Read Access product-images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload product-images'
  ) THEN
    CREATE POLICY "Authenticated Upload product-images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow authenticated users to delete their own uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Delete product-images'
  ) THEN
    CREATE POLICY "Authenticated Delete product-images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Allow staff to manage all product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Staff Manage product-images'
  ) THEN
    CREATE POLICY "Staff Manage product-images"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (
        bucket_id = 'product-images'
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('staff', 'admin')
        )
      )
      WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('staff', 'admin')
        )
      );
  END IF;
END $$;
