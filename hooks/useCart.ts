import { FREE_SHIPPING_THRESHOLD_PHP, SHIPPING_FEE_PHP } from '@/constants';
import { useCartStore } from '@/store';

export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

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

  const total = subtotal + shippingFee;

  return {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,

    qualifyForFreeShipping,
    remainingForFreeShipping,
    shippingProgress,

    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
