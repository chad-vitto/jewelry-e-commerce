import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
    ChevronLeft,
    Edit3,
    ImageIcon,
    Plus,
    Search,
    ToggleLeft,
    ToggleRight,
    Trash2
} from 'lucide-react-native';
import { CATEGORIES, formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { GoldPurityBadge, StockBadge } from '@/components';
import { Image } from 'expo-image';
import { Product, ProductCategory } from '@/types';
import { Shadows } from '@/constants/shadows';
import { Stack, useRouter } from 'expo-router';
import { useAdminProducts } from '@/hooks';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    TextInput,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminProductsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, fetchProducts, toggleActive, deleteProduct } = useAdminProducts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return products.filter((product) =>
      (!normalizedSearch || product.name.toLowerCase().includes(normalizedSearch)) &&
      (selectedCategory === 'all' || product.category === selectedCategory),
    );
  }, [products, search, selectedCategory]);

  const handleToggleActive = useCallback(async (product: Product) => {
    await toggleActive(product.id, !product.is_active);
  }, [toggleActive]);

  const handleDelete = useCallback((product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
          },
        },
      ],
    );
  }, [deleteProduct]);

  const handleManageImages = useCallback((productId: string) => {
    router.push({ pathname: '/admin/products/images' as any, params: { id: productId } });
  }, [router]);

  const handleEdit = useCallback((productId: string) => {
    router.push({ pathname: '/products/[id]' as any, params: { id: productId } });
  }, [router]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <AdminProductRow
      product={item}
      onToggleActive={handleToggleActive}
      onManageImages={handleManageImages}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ), [handleDelete, handleEdit, handleManageImages, handleToggleActive]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Products</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/admin/products/newProduct' as any)}
        >
          <Plus size={24} color={colors.gold.DEFAULT} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={colors.text.muted}
          />
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        data={[{ id: 'all', name: 'All' }, ...CATEGORIES]}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.filterList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.id;
          return (
            <Pressable
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() =>
                setSelectedCategory(item.id as ProductCategory | 'all')
              }
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

interface AdminProductRowProps {
  product: Product;
  onToggleActive: (product: Product) => void;
  onManageImages: (productId: string) => void;
  onEdit: (productId: string) => void;
  onDelete: (product: Product) => void;
}

const AdminProductRow = memo(function AdminProductRow({
  product,
  onToggleActive,
  onManageImages,
  onEdit,
  onDelete,
}: AdminProductRowProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const imageUrl = product.product_images?.[0]?.image_url ||
    'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg?auto=compress&cs=tinysrgb&w=200';

  return (
    <View style={styles.productCard}>
      <Image source={{ uri: imageUrl }} style={styles.productImage} contentFit="cover" />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <View style={styles.productMeta}>
          <GoldPurityBadge purity={product.gold_purity} />
          <StockBadge quantity={product.stock_quantity} />
        </View>
        <Text style={styles.productPrice}>{formatCurrency(product.price_php)}</Text>
      </View>
      <View style={styles.productActions}>
        <Pressable
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={product.is_active ? 'Deactivate product' : 'Activate product'}
          onPress={() => onToggleActive(product)}
        >
          {product.is_active ? (
            <ToggleRight size={22} color={colors.status.success} />
          ) : (
            <ToggleLeft size={22} color={colors.text.muted} />
          )}
        </Pressable>
        <Pressable style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Manage product images" onPress={() => onManageImages(product.id)}>
          <ImageIcon size={18} color={colors.gold.DEFAULT} />
        </Pressable>
        <Pressable style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Edit product" onPress={() => onEdit(product.id)}>
          <Edit3 size={18} color={colors.gold.DEFAULT} />
        </Pressable>
        <Pressable style={styles.actionButton} accessibilityRole="button" accessibilityLabel="Delete product" onPress={() => onDelete(product)}>
          <Trash2 size={18} color={colors.status.error} />
        </Pressable>
      </View>
    </View>
  );
}, (previous, next) =>
  previous.onToggleActive === next.onToggleActive &&
  previous.onManageImages === next.onManageImages &&
  previous.onEdit === next.onEdit &&
  previous.onDelete === next.onDelete &&
  previous.product.id === next.product.id &&
  previous.product.name === next.product.name &&
  previous.product.product_images?.[0]?.image_url === next.product.product_images?.[0]?.image_url &&
  previous.product.gold_purity === next.product.gold_purity &&
  previous.product.stock_quantity === next.product.stock_quantity &&
  previous.product.price_php === next.product.price_php &&
  previous.product.is_active === next.product.is_active,
);

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    gap: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.primary,
  },
  filterContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  filterList: {
    height: 52,
    flexGrow: 0,
  },
  filterPill: {
    minHeight: 38,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  filterPillActive: {
    backgroundColor: colors.gold.DEFAULT,
    borderColor: colors.gold.DEFAULT,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    ...Shadows.premium,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 4,
  },
  actionButton: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text.muted,
  },
});
