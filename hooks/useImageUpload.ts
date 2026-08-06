import { useCallback, useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL } from '@/constants/config';

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

interface UploadedImage {
  publicUrl: string;
  storagePath: string;
}

const normalizeStoragePath = (path: string) =>
  path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const buildPublicStorageUrl = (bucket: string, path: string) => {
  const storageUrl = SUPABASE_URL.replace(/\/$/, '');

  if (!storageUrl || storageUrl.includes('placeholder.supabase.co')) {
    throw new Error(
      'Supabase storage is not configured correctly. Add your project URL and anon key.'
    );
  }

  return `${storageUrl}/storage/v1/object/public/${bucket}/${normalizeStoragePath(path)}`;
};

const readFileAsArrayBuffer = async (uri: string): Promise<ArrayBuffer> => {
  if (uri.startsWith('data:')) {
    const base64 = uri.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

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

  const arrayBuffer = await readFileAsArrayBuffer(file.uri);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, arrayBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  return {
    publicUrl: buildPublicStorageUrl(bucket, data.path),
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
      try {
        isUploadingRef.current = true;
        setUploading(true);
        setUploadProgress(10);
        setError(null);

        const result = await uploadFileToStorage(file, bucket);

        setUploadProgress(100);


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
