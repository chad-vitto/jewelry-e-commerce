import React from 'react';
import { Colors, formatCurrency, Shadows } from '@/constants';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Product } from '@/types';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

function ProductCardComponent({
  product,
  onPress,
  isWishlisted = false,
  onWishlistToggle,
}: ProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/products/[id]" as any,
        params: { id: product.id },
      });
    }
  };

  const imageUrl =
    product.product_images?.[0]?.image_url ||
    'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg';

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price_php)}`}
    >
      <View style={styles.imageContainer}>
        <Image source={imageUrl} style={styles.image} contentFit="cover" />
        <Pressable
          style={styles.wishlistButton}
          onPress={onWishlistToggle}
          accessibilityLabel={
            isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
          }
        >
          <Heart
            size={20}
            color={isWishlisted ? Colors.gold.DEFAULT : Colors.text.muted}
            fill={isWishlisted ? Colors.gold.DEFAULT : 'transparent'}
          />
        </Pressable>

        {product.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productSpecs}>
          <Text style={styles.karatText}>{product.gold_purity}</Text>
          {product.weight_grams ? (
            <Text> • {product.weight_grams}g</Text>
          ) : null}
        </Text>
        <Text style={styles.price}>{formatCurrency(product.price_php)}</Text>
      </View>
    </Pressable>
  );
}

export const ProductCard = React.memo(ProductCardComponent);

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceLight,
  },
  wishlistButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 12,
    ...Shadows.lg,
  },
  featuredText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...Shadows.lg,
  },
  content: {
    padding: 12,
  },
  name: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.text.primary,
  },

  productSpecs: {
    marginBottom: 5,
    fontFamily: 'Inter_500medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },

  karatText: {
    color: Colors.gold.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
  },
});
