import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Upload, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Colors } from '@/constants';
import { Image } from 'expo-image';

interface ImageUploaderProps {
  onImagesSelected: (urls: string[]) => void;
  initialImages?: string[];
  maxImages?: number;
  compact?: boolean;
}

// Note: This component relies on the useImageUpload hook for handling the actual upload and deletion of images from Supabase storage. The hook should provide the uploadImage and deleteImage functions, as well as state for uploading status, progress, and any errors. The component also uses Expo's ImagePicker for selecting images from the device's library. The UI includes a main upload area, a scrollable list of selected images with controls for reordering and deleting, and a compact mode for smaller screens or inline use.

export const ImageUploader = ({
  onImagesSelected,
  initialImages = [],
  maxImages = 5,
  compact = false,
}: ImageUploaderProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>(initialImages);
  const { uploadImage, deleteImage, uploading, uploadProgress, error } =
    useImageUpload();

  useEffect(() => {
    setSelectedImages(initialImages);
  }, [initialImages]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const updatedImages = [...selectedImages];
      let added = 0;

      for (const asset of result.assets) {
        if (updatedImages.length >= maxImages) break;

        const url = await uploadImage({
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.mimeType || 'image/jpeg',
        });

        if (url) {
          console.log('UPLOADED URL:', url);

          updatedImages.push(url);
          added += 1;
        }
      }

      if (added > 0) {
        console.log('FINAL IMAGES:', updatedImages);

        const finalImages = updatedImages.slice(0, maxImages);
        setSelectedImages(finalImages);
        onImagesSelected(finalImages);
      }

      if (updatedImages.length >= maxImages) {
        Alert.alert('Limit Reached', `Maximum ${maxImages} images allowed`);
      }
    }
  };

  const removeImage = async (url: string, index: number) => {
    Alert.alert('Remove Image', 'Delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const deleted = await deleteImage(url);
          if (deleted) {
            const updated = selectedImages.filter((_, i) => i !== index);
            setSelectedImages(updated);
            onImagesSelected(updated);
          } else {
            Alert.alert('Delete Failed', 'Unable to remove image from storage');
          }
        },
      },
    ]);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedImages.length) return;

    const reordered = [...selectedImages];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    setSelectedImages(reordered);
    onImagesSelected(reordered);
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          onPress={pickImages}
          disabled={uploading || selectedImages.length >= maxImages}
          style={[styles.compactButton, uploading && styles.disabled]}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" color={Colors.gold.DEFAULT} />
              <Text style={styles.compactText}>Uploading...</Text>
              <Text style={styles.compactSubtext}>
                {uploadProgress}% complete
              </Text>
            </>
          ) : (
            <>
              <Upload size={20} color={Colors.gold.DEFAULT} />
              <Text style={styles.compactText}>
                {selectedImages.length}/{maxImages}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.compactScroll}
        >
          {selectedImages.map((url, i) => (
            <View key={i} style={styles.compactImageWrapper}>
              <Image source={{ uri: url }} style={styles.compactImage} />
              <TouchableOpacity
                onPress={() => removeImage(url, i)}
                style={styles.compactDeleteButton}
              >
                <X size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Images</Text>
        <Text style={styles.subtitle}>
          {selectedImages.length}/{maxImages}
        </Text>
      </View>

      <TouchableOpacity
        onPress={pickImages}
        disabled={uploading || selectedImages.length >= maxImages}
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
      >
        {uploading ? (
          <>
            <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
            <Text style={styles.uploadText}>Uploading...</Text>
            <Text style={styles.uploadSubtext}>{uploadProgress}% complete</Text>
          </>
        ) : (
          <>
            <Upload size={32} color={Colors.gold.DEFAULT} />
            <Text style={styles.uploadText}>Add Images</Text>
            <Text style={styles.uploadSubtext}>
              Tap to select up to {maxImages} photos
            </Text>
          </>
        )}
      </TouchableOpacity>

      {selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
          contentContainerStyle={styles.imageScrollContent}
        >
          {selectedImages.map((url, i) => (
            <View key={i} style={styles.imageWrapper}>
              <Image source={{ uri: url }} style={styles.image} />
              <View style={styles.imageNumber}>
                <Text style={styles.imageNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.imageControlsOverlay}>
                <TouchableOpacity
                  onPress={() => moveImage(i, 'left')}
                  disabled={i === 0}
                  style={[
                    styles.reorderButton,
                    i === 0 && styles.reorderButtonDisabled,
                  ]}
                >
                  <ChevronLeft size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveImage(i, 'right')}
                  disabled={i === selectedImages.length - 1}
                  style={[
                    styles.reorderButton,
                    i === selectedImages.length - 1 &&
                      styles.reorderButtonDisabled,
                  ]}
                >
                  <ChevronRight size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeImage(url, i)}
                style={styles.deleteButton}
              >
                <X size={18} color="white" fill="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {selectedImages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No images selected</Text>
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.secondary,
  },
  uploadButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,
    borderStyle: 'dashed',
    gap: 8,
    minHeight: 120,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold.DEFAULT,
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  imageScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  imageScrollContent: {
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageNumber: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.gold.DEFAULT,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageControlsOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    gap: 8,
  },
  reorderButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderButtonDisabled: {
    opacity: 0.4,
  },
  imageNumberText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#FF4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.text.muted,
  },

  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  compactButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  compactText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold.DEFAULT,
  },
  compactSubtext: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.secondary,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.status.error,
    marginTop: 8,
  },
  compactScroll: {
    flex: 1,
  },
  compactImageWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactDeleteButton: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
