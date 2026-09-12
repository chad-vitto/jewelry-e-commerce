import { OrderStatus } from '@/types';

/**
 * Display labels for each order status.
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Preparing Order',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/**
 * Timeline metadata for fulfillment steps.
 * Shared by Admin and Customer timelines.
 */
export interface FulfillmentStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon?: string;
}

export const FULFILLMENT_STEPS: FulfillmentStep[] = [
  {
    status: 'processing',
    label: ORDER_STATUS_LABELS.processing,
    description: 'Order is being prepared.',
    icon: 'Package',
  },
  {
    status: 'shipped',
    label: ORDER_STATUS_LABELS.shipped,
    description: 'Order has been shipped.',
    icon: 'Truck',
  },
  {
    status: 'delivered',
    label: ORDER_STATUS_LABELS.delivered,
    description: 'Order has been delivered.',
    icon: 'CheckCircle',
  },
];

/**
 * Returns true if the order can no longer advance.
 */
export function isFinalStatus(status: OrderStatus): boolean {
  return status === 'delivered';
}

/**
 * Returns the next fulfillment status.
 */
export function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case 'processing':
      return 'shipped';

    case 'shipped':
      return 'delivered';

    default:
      return null;
  }
}