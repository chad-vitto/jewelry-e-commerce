import { PaymentProof } from '@/types';
import { supabase } from '@/lib/supabase';
import { useCallback, useState } from 'react';

export interface AdminPaymentsAPI {
  loading: boolean;
  error: string | null;

  getPaymentProof: (orderId: string) => Promise<PaymentProof | null>;
  refreshPaymentProof: (orderId: string) => Promise<PaymentProof | null>;

  verifyPayment: (params: { proofId: string }) => Promise<PaymentProof>;
  rejectPayment: (params: {
    proofId: string;
    reason: string;
  }) => Promise<PaymentProof>;
}

export function useAdminPayments(): AdminPaymentsAPI {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentProof = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;

      return data as PaymentProof | null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load payment proof';

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPaymentProof = useCallback(
    async (orderId: string) => getPaymentProof(orderId),
    [getPaymentProof]
  );

  const verifyPayment = useCallback(async ({ proofId }: { proofId: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('verify_payment_proof', {
        p_proof_id: proofId,
      });

      if (error) throw error;
      if (!data) throw new Error('Payment verification returned no data');

      return data as PaymentProof;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to verify payment';

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectPayment = useCallback(
    async ({ proofId, reason }: { proofId: string; reason: string }) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.rpc('reject_payment_proof', {
          p_proof_id: proofId,
          p_reason: reason.trim(),
        });

        if (error) throw error;
        if (!data) throw new Error('Payment rejection returned no data');

        return data as PaymentProof;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to reject payment';

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getPaymentProof,
    refreshPaymentProof,
    verifyPayment,
    rejectPayment,
  };
}