import React from 'react';
import { Colors, formatCurrency } from '@/constants';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
  } from 'react-native';
import { useAuthStore } from '@/store';
import { useOrders } from '@/hooks';
import { useRouter } from 'expo-router';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, signOut, isLoading } = useAuthStore();
  const { orders } = useOrders(user?.id);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <View style={styles.authIconContainer}>
            <User size={48} color={Colors.gold.DEFAULT} />
          </View>
          <Text style={styles.authTitle}>Welcome to Reloved Gold</Text>
          <Text style={styles.authSubtitle}>
            Sign in to access your orders, wishlist, and exclusive offers.
          </Text>

          <Pressable
            style={styles.signInButton}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>

          <Pressable
            style={styles.registerButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const recentOrders = orders.slice(0, 3);

  const canAccessDashboard = user?.role === 'admin' || user?.role === 'staff';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={32} color={Colors.gold.DEFAULT} />
        </View>
        <Text style={styles.userName}>{user?.full_name || 'Guest'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {canAccessDashboard && (
          <Pressable
            style={styles.adminBadge}
            onPress={() => router.push('/admin')}
          >
            <Text style={styles.adminBadgeText}>Admin Dashboard</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </Pressable>
        )}
      </View>

      {/* Order History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Package size={20} color={Colors.gold.DEFAULT} />
          <Text style={styles.sectionTitle}>Order History</Text>
          <Pressable onPress={() => {}}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptySection}>
            <ShoppingBag size={32} color={Colors.text.muted} />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('en-PH')}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderTotal}>
                  {formatCurrency(order.total_amount_php)}
                </Text>
                <View style={styles.orderBadges}>
                  <OrderStatusBadge status={order.order_status} />
                  <PaymentStatusBadge status={order.payment_status} />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Saved Addresses */}
      <Pressable style={styles.menuItem} onPress={() => {}}>
        <MapPin size={22} color={Colors.gold.DEFAULT} />
        <Text style={styles.menuText}>Saved Addresses</Text>
        <ChevronRight size={20} color={Colors.text.muted} />
      </Pressable>

      {/* Wishlist */}
      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/wishlist')}
      >
        <Heart size={22} color={Colors.gold.DEFAULT} />
        <Text style={styles.menuText}>Wishlist</Text>
        <ChevronRight size={20} color={Colors.text.muted} />
      </Pressable>

      {/* Account Settings */}
      <Pressable style={styles.menuItem} onPress={() => {}}>
        <Settings size={22} color={Colors.gold.DEFAULT} />
        <Text style={styles.menuText}>Account Settings</Text>
        <ChevronRight size={20} color={Colors.text.muted} />
      </Pressable>

      {/* Sign Out */}
      <Pressable
        style={[styles.menuItem, styles.signOutItem]}
        onPress={handleSignOut}
      >
        <LogOut size={22} color={Colors.status.error} />
        <Text style={[styles.menuText, { color: Colors.status.error }]}>
          Sign Out
        </Text>
      </Pressable>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  adminBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: Colors.text.primary,
    flex: 1,
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  orderDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.muted,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.gold.DEFAULT,
  },
  orderBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  menuText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  signOutItem: {
    marginTop: 16,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  authSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: Colors.gold.DEFAULT,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  signInButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold.DEFAULT,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  registerButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.gold.DEFAULT,
  },
});
