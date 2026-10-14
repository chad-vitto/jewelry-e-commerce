import { AppState } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type PromotionDiscountType = 'percentage' | 'fixed';

export interface Promotion {
    id: string;
    title: string;
    message: string;
    image_url: string | null;
    discount_text: string | null;
    discount_type: PromotionDiscountType | null;
    discount_value: number | null;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface UsePromotionsReturn {
    promotions: Promotion[];
    isLoading: boolean;
    error: string | null;
    fetchPromotions: () => Promise<void>;
}

export function usePromotions(): UsePromotionsReturn {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const now = new Date().toISOString();

            const { data, error: fetchError } = await supabase
                .from('promotions')
                .select('*')
                .eq('is_active', true)
                .lte('starts_at', now)
                .gt('ends_at', now)
                .order('starts_at', { ascending: false });

            if (fetchError) {
                setError(fetchError.message);
                setPromotions([]);
                return;
            }

            setPromotions((data as Promotion[]) || []);
        } catch (err) {
            console.error('Error fetching customer promotions:', err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred',
            );

            setPromotions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPromotions();
    }, [fetchPromotions]);

    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            (nextAppState) => {
                if (nextAppState === 'active') {
                    void fetchPromotions();
                }
            },
        );

        return () => {
            subscription.remove();
        };
    }, [fetchPromotions]);

    return {
        promotions,
        isLoading,
        error,
        fetchPromotions,
    };
}