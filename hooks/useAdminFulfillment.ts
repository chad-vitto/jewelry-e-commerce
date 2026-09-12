import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus } from '@/types';

type FulfillmentStatus = Extract<OrderStatus, 'processing' | 'shipped' | 'delivered'>;

interface AdvanceFulfillmentParams {
  orderId: string;
  status: FulfillmentStatus;
  trackingNumber?: string;
}

export function useAdminFulfillment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const advanceFulfillment = useCallback(async ({
    orderId,
    status,
    trackingNumber,
  }: AdvanceFulfillmentParams): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('advance_order_fulfillment', {
        p_order_id: orderId,
        p_next_status: status,
        p_tracking_number: trackingNumber?.trim() || null,
      });

      if (rpcError) {
        throw rpcError;
      }

      return data as Order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update fulfillment status';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { advanceFulfillment, loading, error };
}
