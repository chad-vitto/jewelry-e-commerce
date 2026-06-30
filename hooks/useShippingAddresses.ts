import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShippingAddress, AddressForm } from '@/types';
import { useAuthStore } from '@/store';

interface UseAddressesReturn {
  addresses: ShippingAddress[];
  isLoading: boolean;
  error: string | null;
  addAddress: (address: AddressForm) => Promise<{ error: string | null; data?: ShippingAddress }>;
  updateAddress: (id: string, address: Partial<AddressForm>) => Promise<{ error: string | null }>;
  deleteAddress: (id: string) => Promise<{ error: string | null }>;
  setDefaultAddress: (id: string) => Promise<{ error: string | null }>;
  refetch: () => Promise<void>;
}

export function useShippingAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  const fetchAddresses = async () => {
    if (!user?.id) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setAddresses((data as ShippingAddress[]) || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  const addAddress = async (
    address: AddressForm
  ): Promise<{ error: string | null; data?: ShippingAddress }> => {
    if (!user?.id) {
      return { error: 'You must be logged in' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('shipping_addresses')
        .insert({
          customer_id: user.id,
          label: address.label,
          full_name: address.full_name,
          phone_number: address.phone_number,
          address_line1: address.address_line1,
          address_line2: address.address_line2 || null,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code,
          is_default: address.is_default,
        })
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      await fetchAddresses();
      return { error: null, data: data as ShippingAddress };
    } catch (err) {
      console.error('Error adding address:', err);
      return { error: 'Failed to add address' };
    }
  };

  const updateAddress = async (
    id: string,
    updates: Partial<AddressForm>
  ): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'You must be logged in' };
    }

    try {
      const { error: updateError } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', id)
        .eq('customer_id', user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchAddresses();
      return { error: null };
    } catch (err) {
      console.error('Error updating address:', err);
      return { error: 'Failed to update address' };
    }
  };

  const deleteAddress = async (id: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'You must be logged in' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id)
        .eq('customer_id', user.id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      await fetchAddresses();
      return { error: null };
    } catch (err) {
      console.error('Error deleting address:', err);
      return { error: 'Failed to delete address' };
    }
  };

  const setDefaultAddress = async (id: string): Promise<{ error: string | null }> => {
    if (!user?.id) {
      return { error: 'You must be logged in' };
    }

    try {
      // Unset all default addresses
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id);

      // Set the selected one as default
      const { error: updateError } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('customer_id', user.id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchAddresses();
      return { error: null };
    } catch (err) {
      console.error('Error setting default address:', err);
      return { error: 'Failed to set default address' };
    }
  };

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
