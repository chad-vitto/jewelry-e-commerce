import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WishlistItem } from '@/types';
import { useAuthStore } from '@/store';

interface UseWishlistDBReturn {
  wishlistItems: WishlistItem[];
  wishlistIds: string[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<{ error: string | null }>;
  removeFromWishlist: (productId: string) => Promise<{ error: string | null }>;
  refetch: () => Promise<void>;
}

export function useWishlistDB(): UseWishlistDBReturn {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const fetchWishlist = async () => {
    if (!user?.id) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('wishlist')
        .select('*')
        .eq('customer_id', user.id);

      if (fetchError) {
        setError(fetchError.message);
        setWishlistItems([]);
        return;
      }

      setWishlistItems((data as WishlistItem[]) || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to fetch wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id]);

  const addToWishlist = async (productId: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'You must be logged in to add items to wishlist' };
    }

    try {
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert({
          customer_id: user.id,
          product_id: productId,
        });

      if (insertError) {
        return { error: insertError.message };
      }

      await fetchWishlist();
      return { error: null };
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return { error: 'Failed to add to wishlist' };
    }
  };

  const removeFromWishlist = async (productId: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'You must be logged in' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('customer_id', user.id)
        .eq('product_id', productId);

      if (deleteError) {
        return { error: deleteError.message };
      }

      await fetchWishlist();
      return { error: null };
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return { error: 'Failed to remove from wishlist' };
    }
  };

  const wishlistIds = wishlistItems.map((item) => item.product_id);

  return {
    wishlistItems,
    wishlistIds,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlist,
  };
}
