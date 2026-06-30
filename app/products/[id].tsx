import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProduct, useProducts } from '@/hooks';
import { useWishlistStore, useCartStore } from '@/store';
import {
  SectionSkeleton,
  GoldPurityBadge,
  StockBadge,
  ProductCarousel,
} from '@/components';
import { GoldButton } from '@/components/GoldGradient';
import { Colors, formatCurrency } from '@/constants';
import {
  ArrowLeft,
  Heart,
  Share2,
  Scale,
  MessageCircle,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.5;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product, isLoading, error } = useProduct(id as string);
  const { productIds: wishlistIds, toggleItem: toggleWishlist } =
    useWishlistStore();
  const { items, addItem: addToCart } = useCartStore();
  const { products: relatedProducts } = useProducts();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>();

  const isWishlisted = product ? wishlistIds.includes(product.id) : false;

  const relatedItems = relatedProducts
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 6);

  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentImageIndex(index);
  };

  const validatePurchase = () => {
    if (!product) return false;

    if (product.available_sizes.length > 0 && !selectedSize) {
      Alert.alert('Select Size', 'Please select a size before proceeding.');

      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!validatePurchase() || !product) return;

    const existingItem = items.find(
      (item) => item.product.id === product.id && item.size === selectedSize,
    );

    const currentQty = existingItem?.quantity ?? 0;

    if (currentQty >= product.stock_quantity) {
      Alert.alert(
        'Stock Limit Reached',
        `Only ${product.stock_quantity} item(s) available in stock.`,
      );
      return;
    }

    addToCart(product, 1, selectedSize);
    router.push('/cart');
  };

  const handleBuyNow = () => {
    if (!validatePurchase() || !product) return;

    addToCart(product, 1, selectedSize);
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product.id);
    }
  };

  const handleInquire = () => {
    // Open inquiry modal (to be implemented)
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SectionSkeleton />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const images = product.product_images?.length
    ? product.product_images
        .sort(
          (a: { display_order: number }, b: { display_order: number }) =>
            a.display_order - b.display_order,
        )
        .map((img: { image_url: string }) => img.image_url)
    : ['https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleWishlistToggle}>
            <Heart
              size={24}
              color={isWishlisted ? Colors.gold.DEFAULT : Colors.text.secondary}
              fill={isWishlisted ? Colors.gold.DEFAULT : 'transparent'}
            />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Share2 size={24} color={Colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            keyExtractor={(_, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleImageScroll}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.productImage}
                contentFit="cover"
                transition={300}
              />
            )}
          />
          {images.map((_: any, index: React.Key | null | undefined) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <GoldPurityBadge purity={product.gold_purity} />
            <StockBadge quantity={product.stock_quantity} />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>{formatCurrency(product.price_php)}</Text>

          {/* Specifications */}
          <View style={styles.specsContainer}>
            <View style={styles.specItem}>
              <Scale size={16} color={Colors.gold.DEFAULT} />
              <Text style={styles.specLabel}>Weight</Text>
              <Text style={styles.specValue}>{product.weight_grams}g</Text>
            </View>
          </View>

          {/* Available Sizes */}
          {product.available_sizes.length > 0 && (
            <View style={styles.sizesContainer}>
              <Text style={styles.sizesTitle}>Available Sizes</Text>
              <View style={styles.sizesRow}>
                {product.available_sizes.map((size: string) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizeChip,
                      selectedSize === size && styles.sizeChipSelected,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedSize === size && styles.sizeTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text
              style={styles.description}
              numberOfLines={isExpanded ? undefined : 4}
            >
              {product.description}
            </Text>
            {product.description.length > 150 && (
              <Pressable onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.expandText}>
                  {isExpanded ? 'Show Less' : 'Read More'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <GoldButton
              title="Add to Cart"
              onPress={handleAddToCart}
              variant="gradient"
              size="lg"
              disabled={product.stock_quantity === 0}
            />
            <View style={styles.buttonSpacer} />
            <GoldButton
              title="Buy Now"
              onPress={handleBuyNow}
              variant="outline"
              size="lg"
              disabled={product.stock_quantity === 0}
            />
            <View style={styles.buttonSpacer} />
            <Pressable style={styles.inquireButton} onPress={handleInquire}>
              <MessageCircle size={18} color={Colors.gold.DEFAULT} />
              <Text style={styles.inquireText}>Inquire About This Piece</Text>
            </Pressable>
          </View>

          {/* Related Products */}
          {relatedItems.length > 0 && (
            <View style={styles.relatedContainer}>
              <ProductCarousel
                title="You May Also Like"
                products={relatedItems}
                wishlistIds={wishlistIds}
                onWishlistToggle={toggleWishlist}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
  },
  productImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(201, 168, 76, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: Colors.gold.DEFAULT,
    width: 24,
  },
  content: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.primary,
    marginTop: -24,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: Colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.gold.DEFAULT,
    marginBottom: 20,
  },
  specsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.DEFAULT,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.muted,
  },
  specValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  sizesContainer: {
    marginBottom: 20,
  },
  sizesTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  sizeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sizeChipSelected: {
    backgroundColor: Colors.gold.DEFAULT,
    borderColor: Colors.gold.DEFAULT,
  },

  sizeTextSelected: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  expandText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  inquireButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  inquireText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.gold.DEFAULT,
  },
  relatedContainer: {
    marginBottom: 40,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 100,
  },
  buttonSpacer: {
    height: 12,
  },
});
