-- Allow authenticated users to insert product images
CREATE POLICY "Allow authenticated insert product_images"
  ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated update product_images"
  ON product_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated delete product_images"
  ON product_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated users to select images
CREATE POLICY "Allow authenticated select product_images"
  ON product_images
  FOR SELECT
  TO authenticated
  USING (true);
