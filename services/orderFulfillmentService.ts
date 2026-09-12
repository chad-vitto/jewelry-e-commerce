// services/orderFulfillmentService.ts
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

/**
 * Start Processing
 * - Updates order status to "processing"
 * - Sets processing_started_at timestamp
 */
export async function startProcessing(orderId: string): Promise<Order | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update({
      order_status: 'processing',
      processing_at: now,
      updated_at: now,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Ship Order
 * - Updates order status to "shipped"
 * - Records tracking number, carrier, and shipped_at timestamp
 */
export async function shipOrder(
  orderId: string,
  params: { trackingNumber?: string | null; shippingCarrier?: string | null }
): Promise<Order | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update({
      order_status: 'shipped',
      tracking_number: params.trackingNumber ?? null,
      shipping_carrier: params.shippingCarrier ?? null,
      shipped_at: now,
      updated_at: now,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

/**
 * Mark Delivered
 * - Updates order status to "delivered"
 * - Sets delivered_at timestamp
 */
export async function markDelivered(orderId: string): Promise<Order | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update({
      order_status: 'delivered',
      delivered_at: now,
      updated_at: now,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}
