-- Drop ALL existing profile policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- Simple INSERT policy: Allow any authenticated user to insert
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Simple SELECT policy: Users can only view their own profile
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Simple UPDATE policy: Users can only update their own profile
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
