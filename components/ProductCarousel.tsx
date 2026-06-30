import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Colors } from '@/constants';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ProductCarouselProps {
  title: string;
  products: Product[];
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  wishlistIds?: string[];
  onWishlistToggle?: (productId: string) => void;
}

export function ProductCarousel({
  title,
  products,
  showSeeAll = false,
  onSeeAll,
  wishlistIds = [],
  onWishlistToggle,
}: ProductCarouselProps) {
  const router = useRouter();

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/products/[id]" as any,
      params: { id: product.id },
    });
  };

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeAll && (
          <Text style={styles.seeAll} onPress={onSeeAll}>
            See All
          </Text>
        )}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            isWishlisted={wishlistIds.includes(item.id)}
            onWishlistToggle={() => onWishlistToggle?.(item.id)}
          />
        )}
      />
    </View>
  );
}

interface ProductGridProps {
  title?: string;
  products: Product[];
  wishlistIds?: string[];
  onWishlistToggle?: (productId: string) => void;
  numColumns?: number;
}

export function ProductGrid({
  title,
  products,
  wishlistIds = [],
  onWishlistToggle,
  numColumns = 2,
}: ProductGridProps) {
  const router = useRouter();

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/products/[id]" as any,
      params: { id: product.id },
    });
  };

  return (
    <View style={styles.gridContainer}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => handleProductPress(product)}
            isWishlisted={wishlistIds.includes(product.id)}
            onWishlistToggle={() => onWishlistToggle?.(product.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  gridContainer: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
});
