import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  ImageIcon,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2
  } from 'lucide-react-native';
import { CATEGORIES, Colors, formatCurrency } from '@/constants';
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

export default function AdminProductsScreen() {
  const router = useRouter();
  const { products, isLoading, fetchProducts, toggleActive, deleteProduct } =
    useAdminProducts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, search, selectedCategory]);

  const handleToggleActive = async (product: Product) => {
    await toggleActive(product.id, !product.is_active);
  };

  const handleDelete = (product: Product) => {
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
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image
        source={{
          uri:
            item.product_images?.[0]?.image_url ||
            'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg?auto=compress&cs=tinysrgb&w=200',
        }}
        style={styles.productImage}
        contentFit="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.productMeta}>
          <GoldPurityBadge purity={item.gold_purity} />
          <StockBadge quantity={item.stock_quantity} />
        </View>
        <Text style={styles.productPrice}>
          {formatCurrency(item.price_php)}
        </Text>
      </View>
      <View style={styles.productActions}>
        <Pressable onPress={() => handleToggleActive(item)}>
          {item.is_active ? (
            <ToggleRight size={24} color={Colors.status.success} />
          ) : (
            <ToggleLeft size={24} color={Colors.text.muted} />
          )}
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: '/admin/products/images' as any,
              params: { id: item.id },
            })
          }
        >
          <ImageIcon size={18} color={Colors.gold.DEFAULT} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push({
              pathname: "/products/[id]" as any,
              params: { id: item.id },
            })
          }
        >
          <Edit3 size={18} color={Colors.gold.DEFAULT} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
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
        <Text style={styles.headerTitle}>Products</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/admin/products/newProduct' as any)}
        >
          <Plus size={24} color={Colors.gold.DEFAULT} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={Colors.text.muted}
          />
        </View>
      </View>

      {/* Category Filter */}
      <FlatList
        data={[{ id: 'all', name: 'All' }, ...CATEGORIES]}
        keyExtractor={(item) => item.id}
        horizontal
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
        contentContainerStyle={styles.listContent}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
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
    color: Colors.text.primary,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  filterPillActive: {
    backgroundColor: Colors.gold.DEFAULT,
    borderColor: Colors.gold.DEFAULT,
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...Shadows.premium,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.text.muted,
  },
});
