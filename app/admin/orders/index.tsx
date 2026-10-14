import { AdminOrder, OrderStatus } from '@/types';
import { CalendarDays, ChevronLeft, ChevronRight, Crown, Package, Scale, ShoppingBag } from 'lucide-react-native';
import { formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components';
import { Stack, useRouter } from 'expo-router';
import { useAdminOrders } from '@/hooks';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORDER_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: "Refunded" },
];

interface AdminOrderRowProps {
  order: AdminOrder;
  onPress: (order: AdminOrder) => void;
}

const AdminOrderRow = memo(
  function AdminOrderRow({ order, onPress }: AdminOrderRowProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const firstItem = order.order_items[0];
    const product = firstItem?.products;
    const productName = product?.name ?? firstItem?.product_name ?? 'Order items';
    const customerName = order.shipping_address?.full_name ?? 'No shipping address';
    const productImage = product?.product_images?.[0]?.image_url ?? null;
    const totalQuantity = order.order_items.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => onPress(order)}
        android_ripple={{ color: colors.border.subtle }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.headerSideLeft}>
            <Text numberOfLines={1} style={styles.orderReference}>
              #{order.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.customerHeader}>{customerName}</Text>
          <View style={styles.headerSideRight}>
            <View style={styles.dateContainer}>
              <CalendarDays size={14} color={colors.gold.DEFAULT} />
              <Text numberOfLines={1} style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.productRow}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImage} />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text numberOfLines={1} style={styles.productName}>
              {productName}
            </Text>

            <View style={styles.specRow}>
              {!!(product?.gold_purity ?? firstItem?.gold_purity) && (
                <View style={styles.specItem}>
                  <Crown size={13} color={colors.gold.DEFAULT} />
                  <Text style={styles.specText}>{product?.gold_purity ?? firstItem?.gold_purity}</Text>
                </View>
              )}
              {!!product?.weight_grams && (
                <>
                  {!!(product?.gold_purity ?? firstItem?.gold_purity) && <View style={styles.specDivider} />}
                  <View style={styles.specItem}>
                    <Scale size={13} color={colors.gold.DEFAULT} />
                    <Text style={styles.specText}>{product.weight_grams} g</Text>
                  </View>
                </>
              )}
            </View>

            {!!product?.description && (
              <Text numberOfLines={2} style={styles.description}>
                {product.description}
              </Text>
            )}

            <View style={styles.orderBadges}>
              <OrderStatusBadge status={order.order_status} size="sm" />
              <PaymentStatusBadge status={order.payment_status} size="sm" />
            </View>

            {order.order_items.length > 1 && (
              <Text style={styles.moreItems}>+{order.order_items.length - 1} more items</Text>
            )}
          </View>

          <ChevronRight size={20} color={colors.gold.DEFAULT} style={styles.chevron} />
        </View>

        <View style={styles.divider} />
        <View style={styles.orderFooter}>
          <View style={styles.quantityRow}>
            <Package size={15} color={colors.gold.DEFAULT} />
            <Text style={styles.itemCount}>Total Qty: {totalQuantity}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.orderTotal}>{formatCurrency(order.total_amount_php)}</Text>
          </View>
        </View>
      </Pressable>
    );
  },
  (previous, next) =>
    previous.onPress === next.onPress &&
    previous.order.id === next.order.id &&
    previous.order.created_at === next.order.created_at &&
    previous.order.shipping_address?.full_name === next.order.shipping_address?.full_name &&
    previous.order.shipping_address?.phone_number === next.order.shipping_address?.phone_number &&
    previous.order.order_status === next.order.order_status &&
    previous.order.payment_status === next.order.payment_status &&
    previous.order.order_items.length === next.order.order_items.length &&
    previous.order.order_items === next.order.order_items &&
    previous.order.total_amount_php === next.order.total_amount_php,
);

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, fetchOrders } = useAdminOrders();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          void fetchOrders();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const orderCounts = useMemo(() => {
    const counts: Record<OrderStatus | 'all', number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    for (const order of orders) {
      if (order.order_status !== 'refunded') {
        counts[order.order_status] += 1;
      }
      if (order.payment_status === 'refunded') {
        counts.refunded += 1;
      }
    }

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === 'all') return orders;
    if (selectedStatus === 'refunded') {
      return orders.filter((order) => order.payment_status === 'refunded');
    }
    return orders.filter((order) => order.order_status === selectedStatus);
  }, [orders, selectedStatus]);

  const handleOrderPress = useCallback((order: AdminOrder) => {
    router.push({
      pathname: "/admin/orders/[id]" as any,
      params: { id: order.id },
    });
  }, [router]);

  const renderOrder = useCallback(
    ({ item }: { item: AdminOrder }) => (
      <AdminOrderRow order={item} onPress={handleOrderPress} />
    ),
    [handleOrderPress],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filters */}
      <FlatList
        data={ORDER_FILTERS}
        keyExtractor={(item) => item.value}
        horizontal
        style={styles.filterList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => {
          const isSelected = selectedStatus === item.value;

          const count = orderCounts[item.value];

          return (
            <Pressable
              style={[styles.filterPill, isSelected && styles.filterPillActive]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {item.label}
              </Text>
              <View style={[styles.filterBadge, isSelected && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, isSelected && styles.filterBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold.DEFAULT}
            colors={[colors.gold.DEFAULT]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    gap: 6,
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
  filterBadge: {
    backgroundColor: colors.border.DEFAULT,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.primary + '40',
  },
  filterBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  filterBadgeTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerSideLeft: {
    flex: 1,
    minWidth: 0,
  },
  headerSideRight: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  customerHeader: {
    width: '40%',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  orderDate: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.gold.DEFAULT,
    flexShrink: 1,
  },
  productName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
  orderReference: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.gold.DEFAULT,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productImage: {
    width: 92,
    height: 92,
    borderRadius: 10,
    marginRight: 14,
  },
  noImageBox: {
    width: 92,
    height: 92,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 4,
    minHeight: 92,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold.DEFAULT,
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.gold,
    marginHorizontal: 10,
  },
  description: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    color: colors.text.primary,
  },
  moreItems: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
  },
  chevron: {
    alignSelf: 'center',
    transform: [{ translateY: -6 }],
  },
  orderBadges: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    opacity: 0.5,
    marginTop: 4,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
    marginRight: 4,
  },
  orderTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.gold.DEFAULT,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 12,
  },
});
