import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem, ShippingAddressData, ContactInfo } from '@/types';
import { useAuthStore } from '@/store';

interface CreateOrderInput {
  items: OrderItem[];
  subtotal_php: number;
  shipping_fee_php: number;
  payment_method: 'gcash' | 'paymaya' | 'bank_transfer';
  shipping_address: ShippingAddressData;
  contact_info: ContactInfo;
  notes?: string;
}

interface UseOrderCreationReturn {
  isCreating: boolean;
  error: string | null;
  createOrder: (input: CreateOrderInput) => Promise<{ error: string | null; data?: Order }>;
}

export function useOrderCreation(): UseOrderCreationReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const createOrder = async (input: CreateOrderInput): Promise<{ error: string | null; data?: Order }> => {
    setIsCreating(true);
    setError(null);

    try {
      const orderData = {
        customer_id: user?.id || null,
        items: input.items,
        subtotal_php: input.subtotal_php,
        shipping_fee_php: input.shipping_fee_php,
        total_amount_php: input.subtotal_php + input.shipping_fee_php,
        payment_method: input.payment_method,
        payment_status: 'pending' as const,
        order_status: 'pending' as const,
        shipping_address: input.shipping_address,
        contact_info: input.contact_info,
        notes: input.notes || null,
        tracking_number: null,
      };

      const { data, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setIsCreating(false);
        return { error: insertError.message };
      }

      setIsCreating(false);
      return { error: null, data: data as Order };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      setIsCreating(false);
      return { error: errorMessage };
    }
  };

  return {
    isCreating,
    error,
    createOrder,
  };
}
