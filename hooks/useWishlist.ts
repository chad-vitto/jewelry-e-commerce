import { useWishlistStore } from '@/store';

export function useWishlist() {
  const {
    productIds,
    isLoading,
    toggleItem,
    isInWishlist,
    fetchWishlist,
    syncWithServer,
  } = useWishlistStore();

  return {
    productIds,
    isLoading,
    toggleItem,
    isInWishlist,
    fetchWishlist,
    syncWishlist: syncWithServer,
  };
}
