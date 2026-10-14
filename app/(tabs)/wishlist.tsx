import { useCallback, useEffect, useMemo } from 'react';
import { EmptyWishlist } from '@/components/EmptyState';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { SectionSkeleton } from '@/components';
import { useAuthStore, useWishlistStore } from '@/store';
import { useProducts } from '@/hooks';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const {
    productIds,
    toggleItem,
    fetchWishlist,
    isLoading: wishlistLoading,
  } = useWishlistStore();
  const { user } = useAuthStore();
  const { products: allProducts, isLoading: productsLoading } = useProducts();

  useEffect(() => {
    if (user) {
      void fetchWishlist(user.id);
    }
  }, [user, fetchWishlist]);

  const wishlistProducts = useMemo(() => {
    return allProducts.filter((p) => productIds.includes(p.id));
  }, [allProducts, productIds]);

  const handleWishlistToggle = useCallback((productId: string) => {
    toggleItem(productId);
  }, [toggleItem]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/products/[id]" as any,
      params: { id: product.id },
    });
  }, [router]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      isWishlisted={true}
      onWishlistToggle={handleWishlistToggle}
    />
  ), [handleProductPress, handleWishlistToggle]);

  if (productsLoading || wishlistLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <SectionSkeleton />
      </View>
    );
  }

  if (wishlistProducts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <EmptyWishlist onBrowse={() => router.push('/shop')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.count}>{wishlistProducts.length}</Text>
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  count: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text.muted,
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
