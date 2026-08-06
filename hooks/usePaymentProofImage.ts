import { useEffect, useState } from 'react';
import { usePaymentProofs } from './usePaymentProofs';

export function usePaymentProofImage(storagePath?: string | null) {
  const { createSignedUrl } = usePaymentProofs();

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!storagePath) {
        setSignedUrl(null);
        return;
      }

      setLoading(true);

      try {
        const url = await createSignedUrl(storagePath);

        if (mounted) {
          setSignedUrl(url);
        }
      } catch (err) {
        console.error('Error loading payment proof image:', err);

        if (mounted) {
          setSignedUrl(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [storagePath, createSignedUrl]);

  return {
    signedUrl,
    loading,
  };
}