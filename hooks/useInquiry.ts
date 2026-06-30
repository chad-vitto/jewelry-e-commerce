import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Inquiry, InquiryForm } from '@/types';

interface UseInquiryReturn {
  submitInquiry: (formData: InquiryForm, productId?: string) => Promise<{ error: string | null }>;
  isSubmitting: boolean;
}

export function useInquiry(): UseInquiryReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitInquiry = async (
    formData: InquiryForm,
    productId?: string
  ): Promise<{ error: string | null }> => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const inquiry = {
        customer_id: user?.id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        product_id: productId || null,
        subject: formData.subject,
        message: formData.message,
        status: 'new' as const,
      };

      const { error } = await supabase
        .from('inquiries')
        .insert(inquiry);

      if (error) {
        console.error('Error submitting inquiry:', error);
        setIsSubmitting(false);
        return { error: error.message };
      }

      setIsSubmitting(false);
      return { error: null };
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setIsSubmitting(false);
      return { error: 'An unexpected error occurred' };
    }
  };

  return { submitInquiry, isSubmitting };
}

export function useInquiries(status?: string) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Fallback to mock data
        const { MOCK_INQUIRIES } = require('@/mock');
        const filtered = status
          ? MOCK_INQUIRIES.filter((i: Inquiry) => i.status === status)
          : MOCK_INQUIRIES;
        setInquiries(filtered);
        return;
      }

      setInquiries((data as Inquiry[]) || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      const { MOCK_INQUIRIES } = require('@/mock');
      setInquiries(MOCK_INQUIRIES);
    } finally {
      setIsLoading(false);
    }
  };

  return { inquiries, isLoading, error, refetch: fetchInquiries };
}
