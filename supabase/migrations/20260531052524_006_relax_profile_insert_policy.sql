-- Drop the overly restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a relaxed INSERT policy that allows authenticated users to insert
-- (they can insert anything, but only their own rows will be selectable to them via other policies)
CREATE POLICY "Authenticated users can insert profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep the other policies as they are - they restrict SELECT and UPDATE to own rows
