import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProductImages } from '@/hooks';
import { Colors } from '@/constants';
import {
  ArrowLeft,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImageIcon,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 2;

export default function ProductImagesScreen() {
  const { id: productId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    images,
    isLoading,
    fetchImages,
    uploadImage,
    deleteImage,
    updateImageOrder,
  } = useProductImages(productId || '');
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId, fetchImages]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchImages().finally(() => setRefreshing(false));
  }, [fetchImages]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const newOrder = images.length;
        const uploadResult = await uploadImage(result.assets[0].uri, newOrder);
        // Show warning if file is large
        {
        }
        {
          Alert.alert('Success', 'Image uploaded successfully');
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to upload image',
      );
      console.error('Error picking image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (imageId: string, imageUrl: string) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            setUploading(true);
            await deleteImage(imageId, imageUrl);
            Alert.alert('Success', 'Image deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete image');
          } finally {
            setUploading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleMoveUp = async (image: any, index: number) => {
    if (index === 0) return;
    const prevImage = images[index - 1];
    await updateImageOrder(image.id, prevImage.display_order);
    await updateImageOrder(prevImage.id, image.display_order);
  };

  const handleMoveDown = async (image: any, index: number) => {
    if (index === images.length - 1) return;
    const nextImage = images[index + 1];
    await updateImageOrder(image.id, nextImage.display_order);
    await updateImageOrder(nextImage.id, image.display_order);
  };

  const renderImageItem = ({ item, index }: any) => (
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.productImage}
        contentFit="cover"
      />

      <View style={styles.imageOverlay}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.imageControls}>
        <Pressable
          style={styles.controlButton}
          onPress={() => handleMoveUp(item, index)}
          disabled={index === 0}
        >
          <ChevronUp
            size={18}
            color={index === 0 ? Colors.text.muted : Colors.gold.DEFAULT}
          />
        </Pressable>

        <Pressable
          style={styles.controlButton}
          onPress={() => handleMoveDown(item, index)}
          disabled={index === images.length - 1}
        >
          <ChevronDown
            size={18}
            color={
              index === images.length - 1
                ? Colors.text.muted
                : Colors.gold.DEFAULT
            }
          />
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteImage(item.id, item.image_url)}
        >
          <Trash2 size={18} color={Colors.status.error} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.headerTitle}>
          <ImageIcon size={28} color={Colors.gold.DEFAULT} />
          <Text style={styles.title}>Manage Images</Text>
        </View>
        <Pressable
          style={styles.uploadButtonHeader}
          onPress={handlePickImage}
          disabled={uploading}
        >
          <Upload size={24} color={Colors.gold.DEFAULT} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {images.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ImageIcon size={48} color={Colors.text.muted} />
              <Text style={styles.emptyText}>No images yet</Text>
              <Text style={styles.emptySubtext}>
                Upload your first product image
              </Text>
            </View>
          ) : (
            <View style={styles.imagesGrid}>
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.row}
              />
            </View>
          )}

          <View style={styles.actionContainer}>
            <Pressable
              style={[
                styles.uploadButton,
                uploading && styles.uploadButtonDisabled,
              ]}
              onPress={handlePickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Upload size={24} color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>Upload New Image</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  uploadButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginTop: 12,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 4,
  },
  imagesGrid: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  orderBadge: {
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  orderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  imageControls: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  controlButton: {
    flex: 1,
    backgroundColor: Colors.surface + 'E0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.status.error + '30',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
});
