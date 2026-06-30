import React, { useEffect, useMemo, useState } from 'react';
import { Colors } from '@/constants';
import { EmptyWishlist } from '@/components/EmptyState';
import {
  FlatList, StyleSheet,
  Text,
  View
} from 'react-native';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { SectionSkeleton } from '@/components';
import { useAuthStore, useWishlistStore } from '@/store';
import { useProducts } from '@/hooks';
import { useRouter } from 'expo-router';

export default function WishlistScreen() {
  const router = useRouter();
  const {
    productIds,
    toggleItem,
    fetchWishlist,
    isLoading: wishlistLoading,
  } = useWishlistStore();
  const { user } = useAuthStore();
  const { products: allProducts, isLoading: productsLoading } = useProducts();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id);
    }
    setIsInitialLoad(false);
  }, [user, fetchWishlist]);

  const wishlistProducts = useMemo(() => {
    return allProducts.filter((p) => productIds.includes(p.id));
  }, [allProducts, productIds]);

  const handleWishlistToggle = (productId: string) => {
    toggleItem(productId);
  };

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: "/products/[id]" as any,
      params: { id: product.id },
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      isWishlisted={true}
      onWishlistToggle={() => handleWishlistToggle(item.id)}
    />
  );

  if (isInitialLoad || productsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <SectionSkeleton />
      </View>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <EmptyWishlist onBrowse={() => router.push('/shop')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.count}>{wishlistProducts.length} items</Text>
      </View>

      <FlatList
        data={wishlistProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  count: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.muted,
  },
  gridContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
