import { CustomerOrder } from '@/types';
import { CustomerOrderCard } from '@/hooks';
import { formatDate, formatPrice } from './format';


export function mapCustomerOrder(order: CustomerOrder): CustomerOrderCard {
  const firstItem = order.order_items?.[0];
  
  // Normalize order_status: trim whitespace and convert to lowercase
  const normalizedStatus = (order.order_status?.trim().toLowerCase() || 'pending') as any;

  return {
    ...order,

    shortId: order.id.slice(0, 8).toUpperCase(),

    firstProductName:
      firstItem?.product_name ?? 'Unknown Product',

    firstProductImage:
      firstItem?.products?.product_images?.[0]?.image_url ?? null,

    itemCount: order.order_items?.length ?? 0,

    totalQuantity: (order.order_items ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0
    ),

    formattedDate: formatDate(order.created_at),
    formattedTotal: formatPrice(order.total_amount_php),

    // Override with normalized order_status
    order_status: normalizedStatus,
    payment_reference: order.payment_reference,
  };
}