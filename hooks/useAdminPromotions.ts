import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';

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

interface UseAdminPromotionsReturn {
    promotions: Promotion[];
    isLoading: boolean;
    error: string | null;
    fetchPromotions: () => Promise<void>;
    createPromotion: (
        promotion: Omit<
            Promotion,
            'id' | 'created_at' | 'updated_at'
        >
    ) => Promise<{ error: string | null; data: Promotion | null }>;
    updatePromotion: (
        id: string,
        updates: Partial<Promotion>
    ) => Promise<{ error: string | null }>;
    deletePromotion: (
        id: string
    ) => Promise<{ error: string | null }>;
    toggleActive: (
        id: string,
        isActive: boolean
    ) => Promise<{ error: string | null }>;
}

export function useAdminPromotions(): UseAdminPromotionsReturn {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = useAuthStore((state) => state.isAdmin);

    const fetchPromotions = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                setError(fetchError.message);
                setPromotions([]);
                return;
            }

            setPromotions((data as Promotion[]) || []);
        } catch (err) {
            console.error('Error fetching admin promotions:', err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            );

            setPromotions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            return;
        }

        void fetchPromotions();
    }, [isAdmin, fetchPromotions]);

    const createPromotion = async (
        promotionData: Omit<
            Promotion,
            'id' | 'created_at' | 'updated_at'
        >
    ) => {
        try {
            const { data, error: insertError } = await supabase
                .from('promotions')
                .insert(promotionData)
                .select()
                .single();

            if (insertError) {
                return {
                    error: insertError.message,
                    data: null,
                };
            }

            await fetchPromotions();

            return {
                error: null,
                data: data as Promotion,
            };
        } catch {
            return {
                error: 'An unexpected error occurred',
                data: null,
            };
        }
    };

    const updatePromotion = async (
        id: string,
        updates: Partial<Promotion>
    ) => {
        try {
            const { error: updateError } = await supabase
                .from('promotions')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (updateError) {
                return { error: updateError.message };
            }

            await fetchPromotions();

            return { error: null };
        } catch {
            return {
                error: 'An unexpected error occurred',
            };
        }
    };

    const deletePromotion = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('promotions')
                .delete()
                .eq('id', id);

            if (deleteError) {
                return { error: deleteError.message };
            }

            await fetchPromotions();

            return { error: null };
        } catch {
            return {
                error: 'An unexpected error occurred',
            };
        }
    };

    const toggleActive = async (
        id: string,
        isActive: boolean
    ) => {
        return updatePromotion(id, {
            is_active: isActive,
        });
    };

    return {
        promotions,
        isLoading,
        error,
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion,
        toggleActive,
    };
}