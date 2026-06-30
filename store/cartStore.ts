import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '@/types';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1, size?: string) => {
        if ((product.stock_quantity ?? 0) <= 0) {
          return;
        }
        triggerHaptic();

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size === size
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            const currentQty = newItems[existingIndex].quantity;

            newItems[existingIndex].quantity = Math.min(
              currentQty + quantity,
              product.stock_quantity ?? 0
            )
            return { items: newItems };
          }

          return {
            items: [...state.items, { product, quantity, size }],
          };
        });
      },

      removeItem: (productId: string, size?: string) => {
        triggerHaptic();

        set((state) => ({
          items: state.items.filter((item) => !(item.product.id === productId && item.size === size)),
        }));
      },

      updateQuantity: (productId: string, quantity: number, size?: string) => {
        triggerHaptic();

        set((state) => {

          const item = state.items.find(
            (i) =>
              i.product.id === productId &&
              i.size === size
          );

          if (!item)
            return state;

          const maxStock = item.product.stock_quantity ?? 0;

          const safeQuantity = Math.min(quantity, maxStock);

          if (safeQuantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  !(
                    i.product.id === productId &&
                    i.size === size)
              ),
            };

          }
          return {
            items: state.items.map((i) =>
              i.product.id === productId &&
                i.size === size
                ? { ...i, quantity: safeQuantity }
                : i
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price_php * item.quantity,
          0
        );
      },
    }),
    {
      name: 'reloved-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
