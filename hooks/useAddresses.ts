import {
    fetchDefaultAddress, getAddresses, getAddressById,
    saveShippingAddress, deleteAddress as deleteShippingAddress,
} from '@/services/addressServices';
import { SaveAddressPayload, ShippingAddress, ShippingAddressForm } from '@/types';
import { useCallback, useState } from 'react';

export function useAddresses(userId?: string) {
    const [address, setAddress] = useState<ShippingAddressForm>({
        full_name: '',
        phone_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        province: '',
        postal_code: '',
    });

    const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [currentAddress, setCurrentAddress] = useState<ShippingAddress | null>(null);

    const loadDefaultAddress = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const data = await fetchDefaultAddress(userId);
            if (data) {
                setShippingAddressId(data.id);
                setCurrentAddress(data);
                setAddress({
                    full_name: data.full_name,
                    phone_number: data.phone_number,
                    address_line1: data.address_line1,
                    address_line2: data.address_line2 ?? '',
                    city: data.city,
                    province: data.province,
                    postal_code: data.postal_code,
                });
            }
        } catch (err) {
            console.error('Load Address Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const loadAddresses = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const data = await getAddresses(userId);
            if (data) {
                setAddresses(data);
            }
        } catch (err) {
            console.error('Load Addresses Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const saveAddress = useCallback(
        async ({ address, label, is_default }: SaveAddressPayload) => {
            if (!userId) throw new Error('User not found');

            setIsLoading(true);
            try {
                const data = await saveShippingAddress(
                    userId,
                    address,
                    shippingAddressId,
                    label,
                    is_default,
                );
                setShippingAddressId(data.id);
                return data;
            } catch (err) {
                console.error('Save Address Error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        }, [userId, shippingAddressId]);

    const loadAddress = useCallback(async (id: string) => {
        setIsLoading(true);

        try {
            const data = await getAddressById(id);

            if (!data) return null;

            setCurrentAddress(data);

            setShippingAddressId(data.id);

            setAddress({
                full_name: data.full_name,
                phone_number: data.phone_number,
                address_line1: data.address_line1,
                address_line2: data.address_line2 ?? '',
                city: data.city,
                province: data.province,
                postal_code: data.postal_code,
            });

            return data;
        } catch (err) {
            console.error('Load Address Error:', err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteAddress = useCallback(async (id: string) => {
        if (!userId) {
            throw new Error('User not found');
        }

        setIsLoading(true);

        try {

            const allAddresses = await getAddresses(userId);

            if (allAddresses.length <= 1) {
                return false;
            }

            await deleteShippingAddress(id);

            setAddresses((prev) =>
                prev.filter((address) => address.id !== id)
            );

            return true;
        } catch (err) {
            console.error('Delete Address Error:', err);

            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    return {
        address,
        setAddress,

        currentAddress,

        shippingAddressId,

        isLoading,

        addresses,

        loadDefaultAddress,
        loadAddresses,
        loadAddress,

        saveAddress,
        deleteAddress,
    };
}
