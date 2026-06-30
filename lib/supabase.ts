import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is not configured. Using fallback values for development.');
}

const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = SUPABASE_ANON_KEY || 'placeholder-key';

// console.log('SUPABASE_URL:', SUPABASE_URL);
// console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type { Profile, Product, Order, Inquiry, WishlistItem, ShippingAddress } from '@/types';
