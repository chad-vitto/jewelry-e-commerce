import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/types';

export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(
    async (userId: string, newRole: UserRole) => {
      try {
        setError(null);

        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId)
          .select();

        if (updateError) throw updateError;

        if (!data || data.length === 0) {
          throw new Error('No rows updated');
        }

        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );

        await fetchUsers(); // Refresh the user list after updating the role

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update user role';
        setError(errorMessage);
        console.error('Error updating user role:', err);
        return false;
      }
    },
    []
  );

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserRole,
  };
}
