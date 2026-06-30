import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductFilters } from '@/types';
import { MOCK_PRODUCTS } from '@/mock/products';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(filters?: ProductFilters): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select(`
    *,
    product_images (
      id,
      image_url,
      display_order
    )
  `)
        .eq('is_active', true);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price_php', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price_php', filters.maxPrice);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Sort
      switch (filters?.sortBy) {
        case 'price_asc':
          query = query.order('price_php', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_php', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        // Fallback to mock data if Supabase fails
        console.warn('Supabase fetch failed, using mock data:', fetchError);
        let filteredProducts = [...MOCK_PRODUCTS];

        if (filters?.category) {
          filteredProducts = filteredProducts.filter((p) => p.category === filters.category);
        }

        if (filters?.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter((p) => p.price_php >= filters.minPrice!);
        }

        if (filters?.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter((p) => p.price_php <= filters.maxPrice!);
        }

        if (filters?.search) {
          filteredProducts = filteredProducts.filter((p) =>
            p.name.toLowerCase().includes(filters.search!.toLowerCase())
          );
        }

        setProducts(filteredProducts);
        setError(null);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Use mock data as fallback
      setProducts(MOCK_PRODUCTS);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
             id,
             image_url,
             display_order
          )
        `)
          .eq('id', id)
          .single();

        if (error) throw error;

        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    isLoading,
    error,
  };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            display_order
          )
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        const featured = MOCK_PRODUCTS.filter((p) => p.is_featured);
        setProducts(featured);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error('Error fetching featured:', err);

      const featured = MOCK_PRODUCTS.filter((p) => p.is_featured);
      setProducts(featured);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    products,
    isLoading,
    refetch: fetchFeatured,
  };
}
