import { AdminOrder, OrderStatus } from '@/types';
import { ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { Colors, formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components';
import { Stack, useRouter } from 'expo-router';
import { useAdminOrders } from '@/hooks';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

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

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { orders, isLoading, fetchOrders } = useAdminOrders();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter((o) => o.order_status === selectedStatus);

  const handleOrderPress = (order: AdminOrder) => {
    router.push({
      pathname: "/admin/orders/[id]" as any,
      params: { id: order.id },
    });
  };

  const renderOrder = ({ item }: { item: AdminOrder }) => (
    <Pressable
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{item.id.slice(0, 12)}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.orderCustomer}>
        <Text style={styles.customerName}>
          {item.shipping_address?.full_name ?? "No shipping address"}
        </Text>
        <Text style={styles.customerEmail}>
          {item.shipping_address?.phone_number}
        </Text>
      </View>

      <View style={styles.orderBadges}>
        <OrderStatusBadge status={item.order_status} />
        <PaymentStatusBadge status={item.payment_status} />
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {item.order_items.length} {item.order_items.length === 1 ? 'item' : 'items'}
        </Text>
        <Text style={styles.orderTotal}>
          {formatCurrency(item.total_amount_php)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Filters */}
      <FlatList
        data={ORDER_FILTERS}
        keyExtractor={(item) => item.value}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => {
          const isSelected = selectedStatus === item.value;
          const count = item.value === 'all'
            ? orders.length
            : orders.filter((o) => o.order_status === item.value).length;

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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.text.primary,
  },
  orderDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  orderCustomer: {
    marginBottom: 12,
  },
  customerName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  customerEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.text.muted,
  },
  orderBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
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
