import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface WishlistStore {
  productIds: string[];
  isLoading: boolean;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: (userId: string) => Promise<void>;
  syncWithServer: (userId: string) => Promise<void>;
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      isLoading: false,

      isInWishlist: (productId: string) => {
        return get().productIds.includes(productId);
      },

      toggleItem: async (productId: string) => {
        triggerHaptic();
        const { productIds } = get();
        const isInList = productIds.includes(productId);

        {/* set({ isLoading: true }); */}

        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            if (isInList) {
              await supabase
                .from('wishlist')
                .delete()
                .eq('customer_id', user.id)
                .eq('product_id', productId);
            } else {
              await supabase
                .from('wishlist')
                .insert({
                  customer_id: user.id,
                  product_id: productId,
                });
            }
          }

          set({
            productIds: isInList
              ? productIds.filter((id) => id !== productId)
              : [...productIds, productId],
            isLoading: false,
          });
        } catch (error) {
          console.error('Error toggling wishlist:', error);
          set({ isLoading: false });
        }
      },

      fetchWishlist: async (userId: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('wishlist')
            .select('product_id')
            .eq('customer_id', userId);

          if (error) {
            console.error('Error fetching wishlist:', error);
            set({ isLoading: false });
            return;
          }

          const productIds = data?.map((item) => item.product_id) || [];
          set({ productIds, isLoading: false });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          set({ isLoading: false });
        }
      },

      syncWithServer: async (userId: string) => {
        const { productIds } = get();
        set({ isLoading: true });

        try {
          // Upload local wishlist items that don't exist on server
          for (const productId of productIds) {
            await supabase
              .from('wishlist')
              .upsert({
                customer_id: userId,
                product_id: productId,
              });
          }

          // Fetch server state
          await get().fetchWishlist(userId);
        } catch (error) {
          console.error('Error syncing wishlist:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'reloved-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
);
