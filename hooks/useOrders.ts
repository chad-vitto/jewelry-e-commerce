import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { MOCK_ORDERS } from '@/mock';
import { useAuthStore } from '@/store';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOrders(customerId?: string): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const queryCustomerId = customerId || user?.id;
      if (queryCustomerId) {
        query = query.eq('customer_id', queryCustomerId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Fallback to mock data
        const filteredOrders = queryCustomerId
          ? MOCK_ORDERS.filter((o) => o.customer_id === queryCustomerId)
          : MOCK_ORDERS;
        setOrders(filteredOrders);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const queryCustomerId = customerId || user?.id;
      const filteredOrders = queryCustomerId
        ? MOCK_ORDERS.filter((o) => o.customer_id === queryCustomerId)
        : MOCK_ORDERS;
      setOrders(filteredOrders);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          // Fallback to mock data
          const mockOrder = MOCK_ORDERS.find((o) => o.id === id);
          if (mockOrder) {
            setOrder(mockOrder);
          } else {
            setError('Order not found');
          }
          return;
        }

        setOrder(data as Order);
      } catch (err) {
        console.error('Error fetching order:', err);
        const mockOrder = MOCK_ORDERS.find((o) => o.id === id);
        if (mockOrder) {
          setOrder(mockOrder);
        } else {
          setError('Order not found');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return { order, isLoading, error };
}
