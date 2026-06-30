-- Drop the recursive policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Keep the simple non-recursive policies
-- Users can only see their own profile
-- (other policies like insert_own_profile, select_own_profile, update_own_profile remain)
