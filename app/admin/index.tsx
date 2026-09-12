import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/store';
import { useAdminOrders, useAdminProducts, useAdminInquiries } from '@/hooks';
import { OrderStatusBadge, InquiryStatusBadge } from '@/components';
import { Colors, formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import {
  PackageOpen,
  ShoppingBag,
  AlertCircle,
  Inbox,
  TrendingUp,
  ChevronRight,
  Settings,
  Users,
} from 'lucide-react-native';

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useAdminOrders();
  const { products, fetchProducts } = useAdminProducts();
  const { inquiries, fetchInquiries } = useAdminInquiries();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchInquiries();
  }, []);

  const totalSales = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + o.total_amount_php, 0);

  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  const recentOrders = orders.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name}</Text>
        </View>
        <Pressable style={styles.settingsButton}>
          <Settings size={24} color={colors.gold.DEFAULT} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.salesCard]}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(totalSales)}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={[styles.statCard, styles.ordersCard]}>
            <View style={styles.statIconContainer}>
              <ShoppingBag size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>

          <View style={[styles.statCard, styles.productsCard]}>
            <View style={styles.statIconContainer}>
              <PackageOpen size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{activeProducts}</Text>
            <Text style={styles.statLabel}>Active Products</Text>
          </View>

          <View style={[styles.statCard, styles.inquiriesCard]}>
            <View style={styles.statIconContainer}>
              <AlertCircle size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{newInquiries}</Text>
            <Text style={styles.statLabel}>New Inquiries</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/admin/products')}
            >
              <PackageOpen size={28} color={colors.gold.DEFAULT} />
              <Text style={styles.actionText}>Manage Products</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/admin/orders')}
            >
              <ShoppingBag size={28} color={colors.gold.DEFAULT} />
              <Text style={styles.actionText}>Manage Orders</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/admin/inquiries')}
            >
              <Inbox size={28} color={colors.gold.DEFAULT} />
              <Text style={styles.actionText}>View Inquiries</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </Pressable>

            {user?.role === 'admin' && (
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/admin/users')}
              >
                <Users size={28} color={colors.gold.DEFAULT} />
                <Text style={styles.actionText}>Manage Users</Text>
                <ChevronRight size={20} color={colors.text.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => router.push('/admin/orders')}>
              <Text style={styles.seeAll}>View All</Text>
            </Pressable>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-PH')}
                </Text>
              </View>
              <View style={styles.orderBadges}>
                <OrderStatusBadge status={order.order_status} />
              </View>
              <Text style={styles.orderTotal}>
                {formatCurrency(order.total_amount_php)}
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Inquiries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Inquiries</Text>
            <Pressable onPress={() => router.push('/admin/inquiries')}>
              <Text style={styles.seeAll}>View All</Text>
            </Pressable>
          </View>
          {recentInquiries.map((inquiry) => (
            <View key={inquiry.id} style={styles.inquiryCard}>
              <View style={styles.inquiryHeader}>
                <View style={styles.inquiryInfo}>
                  <Text style={styles.inquirySubject}>{inquiry.subject}</Text>
                  <Text style={styles.inquiryCustomer}>
                    {inquiry.customer_name}
                  </Text>
                </View>
                <InquiryStatusBadge status={inquiry.status} />
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 2,
  },
  userName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surface,
  },
  salesCard: {
    borderTopWidth: 3,
    borderTopColor: colors.status.success,
  },
  ordersCard: {
    borderTopWidth: 3,
    borderTopColor: colors.status.info,
  },
  productsCard: {
    borderTopWidth: 3,
    borderTopColor: colors.gold.DEFAULT,
  },
  inquiriesCard: {
    borderTopWidth: 3,
    borderTopColor: colors.status.warning,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 12,
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.gold.DEFAULT,
    marginBottom: 12,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text.primary,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
  },
  orderDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  orderBadges: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
  },
  orderTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  inquiryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inquiryInfo: {
    flex: 1,
  },
  inquirySubject: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  inquiryCustomer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
  },
});
