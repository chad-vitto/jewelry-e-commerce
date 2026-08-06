import { CustomerOrder } from '@/types';
import { mapCustomerOrder } from '@/utils/orderMapper';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import { useCallback, useEffect, useState } from 'react';


interface UseOrdersReturn {
  orders: CustomerOrderCard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface CustomerOrderCard extends CustomerOrder {
  shortId: string;
  firstProductName: string;
  firstProductImage: string | null;

  itemCount: number;
  totalQuantity: number;

  formattedDate: string;
  formattedTotal: string;
}

export function useOrders(customerId?: string): UseOrdersReturn {
  const [orders, setOrders] = useState<CustomerOrderCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore((state) => state.user?.id);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const queryCustomerId = customerId || userId;

    try {
      let query = supabase
        .from('orders')
        .select(`
  *,
  shipping_address:shipping_addresses!orders_shipping_address_id_fkey (*),
  order_items (
    *,
    products (
      *,
      product_images (*)
    )
  )
`)
        .order('created_at', { ascending: false });

      if (queryCustomerId) {
        query = query.eq('customer_id', queryCustomerId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const mappedOrders = (data as CustomerOrder[] ?? []).map(mapCustomerOrder);

      setOrders(mappedOrders);

    } catch (err) {
      console.error('Error fetching orders:', err);

      setOrders([]);

      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, userId]);

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      await fetchOrders();
      if (isCancelled) {
        return;
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<CustomerOrderCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:shipping_addresses!orders_shipping_address_id_fkey (*),
          order_items (
            *,
            products (
              *,
              product_images (*)
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError('Order not found');
        setOrder(null);
        return;
      }

      setOrder(mapCustomerOrder(data));
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refetch();
    }, 0);

    return () => clearTimeout(timeoutId)
  }, [refetch]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`order:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          void refetch();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  return { order, isLoading, error, refetch };
}
