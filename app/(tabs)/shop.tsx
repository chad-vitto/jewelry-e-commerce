import { useCallback, useEffect, useMemo, useState } from 'react';
import { Product, ProductCategory, ProductFilters } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProducts } from '@/hooks';
import { useWishlistStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    Text,
} from 'react-native';
import {
    SearchBar,
    CategoryFilter,
    ProductCard,
    SectionSkeleton,
    EmptySearch,
    EmptyCategory,
} from '@/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ITEMS_PER_PAGE = 10;

type ShopCategory = ProductCategory | 'all';

export default function ShopScreen() {
  const router = useRouter();

  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ category?: string; resetCategory?: string }>();

  const { productIds: wishlistIds, toggleItem: toggleWishlist } =
    useWishlistStore();

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSelectedCategory(
      params.category && params.category !== 'all'
        ? params.category as ProductCategory
        : 'all',
    );
    setPage(1);
  }, [params.category, params.resetCategory]);

  const [sortBy, setSortBy] = useState<ProductFilters['sortBy']>('newest');

  const filters: ProductFilters = useMemo(
    () => ({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: search || undefined,
      sortBy,
    }),
    [selectedCategory, search, sortBy],
  );

  const { products, isLoading } = useProducts(filters);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
  };

  const handleWishlistToggle = useCallback((productId: string) => {
    toggleWishlist(productId);
  }, [toggleWishlist]);

  const handleProductPress = useCallback((product: Product) => {
    router.push({
      pathname: "/products/[id]" as any,
      params: { id: product.id },
    });
  }, [router]);

  const paginatedProducts = products.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = products.length > paginatedProducts.length;

  const loadMore = () => {
    if (hasMore) {
      setPage((p) => p + 1);
    }
  };

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      isWishlisted={wishlistIds.includes(item.id)}
      onWishlistToggle={handleWishlistToggle}
    />
  ), [wishlistIds, handleProductPress, handleWishlistToggle]);

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.gold.DEFAULT} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <SearchBar
          value={search}
          onChangeText={handleSearch}
          placeholder="Search rings, necklaces, earrings..."
        />
      </View>
      {/* Categories */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={handleCategoryChange}
      />
      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <View style={styles.sortChips}>
          {[
            { value: 'newest', label: 'Newest' },
            { value: 'price_asc', label: 'Price ↓' },
            { value: 'price_desc', label: 'Price ↑' },
          ].map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.sortChip,
                sortBy === option.value && styles.sortChipActive,
              ]}
              onPress={() =>
                setSortBy(option.value as ProductFilters['sortBy'])
              }
            >
              <Text
                style={[
                  styles.sortChipLabel,
                  sortBy === option.value && styles.sortChipLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.gridContainer}>
          <SectionSkeleton />
        </View>
      ) : products.length === 0 ? (
        search ? (
          <EmptySearch query={search} />
        ) : (
          <EmptyCategory
            categoryName={
              selectedCategory === 'all' ? 'All Products' : selectedCategory
            }
            onBrowse={() => setSelectedCategory('all')}
          />
        )
      ) : (
        <FlatList
          data={paginatedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          renderItem={renderProduct}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 40,
    paddingBottom: 8,
  },
  sortContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  sortChipActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  sortChipLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
  sortChipLabelActive: {
    color: colors.primary,
  },
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
