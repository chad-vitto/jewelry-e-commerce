import { useAuthStore } from '@/store';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    fetchProfile,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    fetchProfile,
  };
}
