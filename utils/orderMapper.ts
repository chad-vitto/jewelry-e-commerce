import { CustomerOrder } from '@/types';
import { CustomerOrderCard } from '@/hooks';
import { formatDate, formatPrice } from './format';


export function mapCustomerOrder(order: CustomerOrder): CustomerOrderCard {
  const firstItem = order.order_items?.[0];
  const product = firstItem?.products;

  const normalizedStatus = (
    order.order_status?.trim().toLowerCase() || 'pending'
  ) as any;

  return {
    ...order,

    shortId: order.id.slice(0, 8).toUpperCase(),

    firstProductName:
      firstItem?.product_name ??
      product?.name ??
      'Unknown Product',

    firstProductImage:
      product?.product_images?.[0]?.image_url ??
      null,

    // ⭐ NEW
    firstProductKarat:
      product?.gold_purity ?? null,

    firstProductWeight:
      product?.weight_grams ?? null,

    firstProductDescription:
      product?.description ?? null,

    itemCount: order.order_items?.length ?? 0,

    totalQuantity: (order.order_items ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0
    ),

    formattedDate: formatDate(order.created_at),

    formattedTotal: formatPrice(order.total_amount_php),

    order_status: normalizedStatus,

    payment_reference: order.payment_reference,
  };
}