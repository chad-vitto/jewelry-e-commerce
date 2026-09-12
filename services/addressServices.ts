import { supabase } from '@/lib/supabase';
import { ShippingAddressForm } from '@/types';

export async function fetchDefaultAddress(userId: string) {
    const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', userId)
        .eq('is_default', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }

    return data;
}

export async function saveShippingAddress(
    userId: string,
    address: ShippingAddressForm,
    shippingAddressId: string | null = null,
    label: string,
    is_default: boolean
) {

    if (is_default) {
        const { error } = await supabase
            .from('shipping_addresses')
            .update({ is_default: false })
            .eq('customer_id', userId)
            .eq('is_default', true);

        if (error) {
            throw error;
        }
    }

    if (shippingAddressId) {
        const { data, error } = await supabase
            .from('shipping_addresses')
            .update({
                label,

                full_name: address.full_name,
                phone_number: address.phone_number,
                address_line1: address.address_line1,
                address_line2: address.address_line2 || null,
                city: address.city,
                province: address.province,
                postal_code: address.postal_code,

                is_default,
            })
            .eq('id', shippingAddressId)
            .eq('customer_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    const { data, error } = await supabase
        .from('shipping_addresses')
        .insert({
            customer_id: userId,
            label,

            full_name: address.full_name,
            phone_number: address.phone_number,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || null,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,

            is_default,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getAddresses(userId: string) {
    const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('customer_id', userId)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getAddressById(id: string) {
    const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
}

export async function deleteAddress(id: string) {
    // Get the address being deleted
    const address = await getAddressById(id);

    if (!address) {
        throw new Error('Address not found.');
    }

    // If deleting the default address,
    // promote another address to default first.
    if (address.is_default) {
        const { data: remainingAddresses, error: fetchError } = await supabase
            .from('shipping_addresses')
            .select('id')
            .eq('customer_id', address.customer_id)
            .neq('id', id)
            .limit(1);

        if (fetchError) throw fetchError;

        if (remainingAddresses && remainingAddresses.length > 0) {
            const { error: updateError } = await supabase
                .from('shipping_addresses')
                .update({ is_default: true })
                .eq('id', remainingAddresses[0].id);

            if (updateError) throw updateError;
        }
    }

    // Delete the address
    const { error } = await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}