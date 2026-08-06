import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  PaymentProof,
  PaymentProofInsert,
  PaymentProofUpdate
} from '@/types';
import { File } from 'expo-file-system';

// Status constants
export enum PaymentProofStatus {
  Pending = 'pending',       // No proof uploaded yet
  Submitted = 'submitted',   // Proof uploaded, waiting for review
  Verified = 'verified',     // Admin approved
  Rejected = 'rejected',     // Admin rejected
}

export function usePaymentProofs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload receipt to storage
  const uploadReceipt = useCallback(
    async (
      imageAsset: {
        uri: string;
        fileName?: string | null;
        mimeType?: string | null;
      },
      orderId: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('User not authenticated');

        const safeName = (imageAsset.fileName ?? 'receipt.jpg').replace(/\s+/g, '-');
        const path = `${user.id}/${orderId}/${Date.now()}-${safeName}`;

        const file = new File(imageAsset.uri);
        const arrayBuffer = await file.arrayBuffer();

        const {
          data: { session },
        } = await supabase.auth.getSession();


        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(path, arrayBuffer, {
            contentType: imageAsset.mimeType ?? 'image/jpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        return {
          storagePath: path,
          uploadedBy: user.id,
        }

      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Failed to upload receipt');
        throw err;

      } finally {
        setLoading(false);
      }
    }, []);

  // Replace receipt
  const replaceReceipt = useCallback(
    async (oldPath: string, imageAsset: { uri: string; fileName?: string | null; mimeType?: string | null }, orderId: string) => {
      await supabase.storage.from('payment-proofs').remove([oldPath]);
      return await uploadReceipt(imageAsset, orderId);
    },
    [uploadReceipt]
  );

  // Create signed URL
  const createSignedUrl = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(path, 60 * 60); // 1 hour
    if (error) throw error;
    return data.signedUrl;
  }, []);

  // Submit proof
  const submitProof = useCallback(async (payload: PaymentProofInsert) => {
    const { data, error } = await supabase
      .from('payment_proofs')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data as PaymentProof;
  }, []);

  const updateProof = useCallback(
    async (id: string, payload: PaymentProofUpdate) => {
      const { data, error } = await supabase
        .from('payment_proofs')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data as PaymentProof;
    },
    []
  );

  // Get proof by order_id
  const getPaymentProof = useCallback(async (orderId: string) => {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();
    if (error) throw error;
    return data as PaymentProof | null;
  }, []);

  // Update after rejection
  const updateAfterRejection = useCallback(
    async (id: string, rejectionReason: string) => {
      const { data, error } = await supabase
        .from('payment_proofs')
        .update({
          status: PaymentProofStatus.Rejected,
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as PaymentProof;
    },
    []
  );

  return {
    loading,
    error,

    uploadReceipt,
    replaceReceipt,
    createSignedUrl,

    submitProof,
    updateProof,
    getPaymentProof,
    updateAfterRejection,

    PaymentProofStatus, // expose constants for UI checks
  };
}
