// types/orderTimeline.ts
import type { OrderStatus } from '@/types';

export interface TimelineStep {
  key: string;
  label: string;
  description: string;
  status?: OrderStatus; // optional link to fulfillment status
}

export const ORDER_TIMELINE: TimelineStep[] = [
  {
    key: 'order_placed',
    label: 'Order Placed',
    description: 'Customer submitted the order',
  },
  {
    key: 'payment_submitted',
    label: 'Payment Submitted',
    description: 'Payment details entered',
  },
  {
    key: 'payment_verified',
    label: 'Payment Verified',
    description: 'Payment confirmed by system',
  },
  {
    key: 'processing',
    label: 'Processing',
    description: 'Order is being prepared',
    status: 'processing',
  },
  {
    key: 'ready_for_shipment',
    label: 'Ready for Shipment',
    description: 'Order is packed and ready',
    status: 'processing',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    description: 'Order has left the warehouse',
    status: 'shipped',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Order has been delivered',
    status: 'delivered',
  },
];
