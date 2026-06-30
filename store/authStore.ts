import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Profile, AuthState } from '@/types';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  canAccessDashboard: boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  canAccessDashboard: false,
  isLoading: true,

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  fetchProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        set({ user: null, isAuthenticated: false, isAdmin: false, canAccessDashboard: false, isLoading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        set({ user: null, isAuthenticated: false, isAdmin: false, canAccessDashboard: false, isLoading: false });
        return;
      }

      if (profile) {
        set({
          user: profile as Profile,
          isAuthenticated: true,
          isAdmin: profile.role === 'admin',
          canAccessDashboard: ['admin', 'staff'].includes(profile.role),
          isLoading: false,
        });

      } else {
        set({ user: null, isAuthenticated: false, isAdmin: false, canAccessDashboard: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      set({ user: null, isAuthenticated: false, isAdmin: false, canAccessDashboard: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      await get().fetchProfile();
      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signUp: async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            phone_number: phone || null,
            role: 'customer',
          });

        if (profileError) {
          set({ isLoading: false });
          return { error: profileError.message };
        }
      }

      await get().fetchProfile();
      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, isAdmin: false, canAccessDashboard: false, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }

    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      canAccessDashboard: false,
      isLoading: false,
    });
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },
}));

// Subscribe to auth changes
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().fetchProfile();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      canAccessDashboard: false,
    });
  }
});
