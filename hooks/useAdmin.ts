/* eslint-disable @typescript-eslint/no-require-imports */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Order, Inquiry } from '@/types';
import { MOCK_PRODUCTS } from '@/mock/products';
import { useAuthStore } from '@/store';

// Admin Products Hook
interface UseAdminProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<{ error: string | null; data: Product | null }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ error: string | null }>;
  deleteProduct: (id: string) => Promise<{ error: string | null }>;
  toggleActive: (id: string, isActive: boolean) => Promise<{ error: string | null }>;
}

export function useAdminProducts(): UseAdminProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
    *,
    product_images (
      image_url,
      display_order
    )
  `)
        .order('created_at', { ascending: false });

      if (error) {
        setProducts(MOCK_PRODUCTS);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, fetchProducts]);

  const createProduct = async (productData: Partial<Product>) => {
    try {

      console.log('PRODUCT DATA:', productData);
      console.log('PRODUCT IMAGES:', productData.product_images);

      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          category: productData.category,
          price_php: productData.price_php,
          gold_purity: productData.gold_purity,
          weight_grams: productData.weight_grams,
          available_sizes: productData.available_sizes || [],
          stock_quantity: productData.stock_quantity || 0,
          is_featured: productData.is_featured || false,
          is_active: productData.is_active ?? true,
        })
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message, data: null };
      }

      await fetchProducts();
      return { error: null, data: data as Product };
    } catch (err) {
      return { error: 'An unexpected error occurred', data: null };
    }
  };


  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return { error: deleteError.message };
      }

      await fetchProducts();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateProduct(id, { is_active: isActive });
  };

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleActive,
  };
}

// Admin Orders Hook
interface UseAdminOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: Order['order_status'], trackingNumber?: string) => Promise<{ error: string | null }>;
  updatePaymentStatus: (id: string, status: Order['payment_status']) => Promise<{ error: string | null }>;
}

export function useAdminOrders(): UseAdminOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { MOCK_ORDERS } = require('@/mock');
        setOrders(MOCK_ORDERS);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      const { MOCK_ORDERS } = require('@/mock');
      setOrders(MOCK_ORDERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, fetchOrders]);

  const updateOrderStatus = async (
    id: string,
    status: Order['order_status'],
    trackingNumber?: string
  ) => {
    try {
      const updates: Partial<Order> = { order_status: status };
      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchOrders();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const updatePaymentStatus = async (id: string, status: Order['payment_status']) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchOrders();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    updatePaymentStatus,
  };
}

// Admin Inquiries Hook
interface UseAdminInquiriesReturn {
  inquiries: Inquiry[];
  isLoading: boolean;
  error: string | null;
  fetchInquiries: () => Promise<void>;
  markAsRead: (id: string) => Promise<{ error: string | null }>;
  replyToInquiry: (id: string, reply: string) => Promise<{ error: string | null }>;
}

export function useAdminInquiries(): UseAdminInquiriesReturn {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = useAuthStore((state) => state.isAdmin);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        const { MOCK_INQUIRIES } = require('@/mock');
        setInquiries(MOCK_INQUIRIES);
        return;
      }

      setInquiries((data as Inquiry[]) || []);
    } catch (err) {
      console.error('Error fetching admin inquiries:', err);
      const { MOCK_INQUIRIES } = require('@/mock');
      setInquiries(MOCK_INQUIRIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchInquiries();
    }
  }, [isAdmin, fetchInquiries]);

  const markAsRead = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({ status: 'read' })
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchInquiries();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const replyToInquiry = async (id: string, reply: string) => {
    try {
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({
          admin_reply: reply,
          replied_at: new Date().toISOString(),
          status: 'replied',
        })
        .eq('id', id);

      if (updateError) {
        return { error: updateError.message };
      }

      await fetchInquiries();
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    inquiries,
    isLoading,
    error,
    fetchInquiries,
    markAsRead,
    replyToInquiry,
  };
}
