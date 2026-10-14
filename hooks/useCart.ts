import { FREE_SHIPPING_THRESHOLD_PHP, SHIPPING_FEE_PHP } from '@/constants';
import { useCartStore } from '@/store';
import { usePromotions } from './usePromotions';
import { useEffect } from 'react';

export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    selectedPromotionId,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const setSelectedPromotionId = useCartStore((state) => state.setSelectedPromotionId);
  const { promotions, isLoading } = usePromotions();
  const activePromotion = promotions.find((promotion) => promotion.id === selectedPromotionId) ?? null;

  useEffect(() => {
    if (
      !isLoading &&
      selectedPromotionId !== null &&
      !promotions.some(
        (promotion) => promotion.id === selectedPromotionId
      )
    ) {
      setSelectedPromotionId(null);
    }
  }, [
    isLoading,
    selectedPromotionId,
    promotions,
    setSelectedPromotionId,
  ]);

  // Calculate shipping based on subtotal
  const qualifyForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD_PHP;

  const remainingForFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD_PHP - subtotal,
    0,
  );

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD_PHP) * 100,
    100,
  );

  const shippingFee = qualifyForFreeShipping ? 0 : SHIPPING_FEE_PHP;

  const discountAmount =
    activePromotion?.discount_type === 'percentage'
      ? Math.round(
        subtotal * ((activePromotion.discount_value ?? 0) / 100) * 100
      ) / 100
      : activePromotion?.discount_type === 'fixed'
        ? Math.min(activePromotion.discount_value ?? 0, subtotal)
        : 0;


  const total = subtotal - discountAmount + shippingFee;

  return {
    items,
    itemCount,
    subtotal,
    shippingFee,
    discountAmount,
    activePromotion,
    total,

    qualifyForFreeShipping,
    remainingForFreeShipping,
    shippingProgress,

    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    promotions,
    selectedPromotionId,
    setSelectedPromotionId,
  };
}
