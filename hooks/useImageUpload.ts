import { useCallback, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

interface UploadedImage {
  publicUrl: string;
  storagePath: string;
}

// Utility function to create a safe and unique file name for storage

const createSafeFileName = (name: string) => {
  const sanitized = name.replace(/[^a-zA-Z0-9._-]+/g, '-');

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}-${sanitized}`;
};

// Main upload function that handles the entire upload process

const uploadFileToStorage = async (
  file: ImageFile,
  bucket: string
): Promise<UploadedImage> => {
  const fileName = createSafeFileName(file.name);

  const response = await fetch(file.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, arrayBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    publicUrl: publicData.publicUrl,
    storagePath: data.path,
  };
};


// Custom hook for image upload and deletion

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isUploadingRef = useRef(false);

  const uploadImage = useCallback(
    async (file: ImageFile, bucket: string = 'product-images'): Promise<string | null> => {
      if (isUploadingRef.current) {
        setError('Another upload is already in progress');
        return null;
      }

      console.log('Uploading image:', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });


      try {
        isUploadingRef.current = true;
        setUploading(true);
        setUploadProgress(10);
        setError(null);

        const result = await uploadFileToStorage(file, bucket);

        setUploadProgress(100);

        console.log('Public URL:', result.publicUrl);

        return result.publicUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        console.error('Image upload error:', err);
        return null;
      } finally {
        isUploadingRef.current = false;
        setUploading(false);
      }
    },
    []
  );
  

  const deleteImage = useCallback(
    async (imageUrl: string, bucket: string = 'product-images') => {
      try {
        const path = imageUrl.split('/').pop();
        if (!path) throw new Error('Invalid image URL');

        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (deleteError) throw deleteError;
        return true;
      } catch (err) {
        console.error('Image delete error:', err);
        return false;
      }
    },
    []
  );

  return { uploadImage, deleteImage, uploading, uploadProgress, error };
};
