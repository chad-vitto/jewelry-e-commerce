import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { usePaymentProofs } from '@/hooks/usePaymentProofs';
import type { PaymentProof } from '@/types';

export function usePaymentProof(orderId?: string) {
    const { getPaymentProof } = usePaymentProofs();

    const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            setError(null);

            const proof = await getPaymentProof(orderId);
            setPaymentProof(proof);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [orderId, getPaymentProof]);

    useEffect(() => {
        if (!orderId) return;

        const timeoutId = window.setTimeout(() => {
            void refresh();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [orderId, refresh]);

    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel(`payment-proof:${orderId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'payment_proofs',
                    filter: `order_id=eq.${orderId}`,
                },
                (payload) => {
                    setPaymentProof(payload.new as PaymentProof);
                    setError(null);
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [orderId]);

    return {
        paymentProof,
        loading,
        error,
        refresh,
    };
}