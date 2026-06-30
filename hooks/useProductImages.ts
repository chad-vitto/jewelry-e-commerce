import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useImageUpload } from './useImageUpload';


export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface UploadImageResult {
  publicUrl: string;
  fileSizeInMB: number;
  warnSize: boolean;
  storagePath: string;
}


export function useProductImages(productId: string) {

  const { uploadImage: uploadToStorage } = useImageUpload();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setImages(data || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch images';
      setError(errorMessage);
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const uploadImage = useCallback(
    async (imageUri: string, displayOrder: number) => {
      try {
        setError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          throw new Error('Not authenticated. Please log in to upload images.');
        }

        const extension =
          imageUri.split('.').pop()?.toLowerCase() || 'jpg';

        let mimeType = 'image/jpeg';

        if (extension === 'png') mimeType = 'image/png';
        if (extension === 'webp') mimeType = 'image/webp';
        if (extension === 'heic') mimeType = 'image/heic';

        const publicUrl = await uploadToStorage(
          {
            uri: imageUri,
            name: `${productId}-${Date.now()}.${extension}`,
            type: mimeType,
          },
          'product-images'
        );


        if (!publicUrl) {
          throw new Error('Upload failed');
        }

        const { data: imageRecord, error: insertError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            display_order: displayOrder,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setImages((prev) =>
          [...prev, imageRecord].sort((a, b) => a.display_order - b.display_order)
        );

        return { imageRecord, publicUrl };
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to upload image';
        setError(errorMessage);
        console.error('Error uploading image:', err);
        throw err;
      }
    },
    [productId, uploadToStorage]
  );

  const deleteImage = useCallback(
    async (imageId: string, imageUrl: string) => {
      try {
        setError(null);

        // Extract filename from URL
        const filePath =
          imageUrl.split('/product-images/')[1];
        if (!filePath) throw new Error('Invalid image URL');

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([filePath]);

        if (deleteError) throw deleteError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('product_images')
          .delete()
          .eq('id', imageId);

        if (dbError) throw dbError;

        // Update local state
        setImages((prev) => prev.filter((img) => img.id !== imageId));

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to delete image';
        setError(errorMessage);
        console.error('Error deleting image:', err);
        throw err;
      }
    },
    []
  );

  const updateImageOrder = useCallback(
    async (imageId: string, newOrder: number) => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from('product_images')
          .update({ display_order: newOrder })
          .eq('id', imageId);

        if (updateError) throw updateError;

        // Update local state
        setImages((prev) =>
          prev
            .map((img) => (img.id === imageId ? { ...img, display_order: newOrder } : img))
            .sort((a, b) => a.display_order - b.display_order)
        );

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update image order';
        setError(errorMessage);
        console.error('Error updating image order:', err);
        throw err;
      }
    },
    []
  );

  return {
    images,
    isLoading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    updateImageOrder,
  };
}
