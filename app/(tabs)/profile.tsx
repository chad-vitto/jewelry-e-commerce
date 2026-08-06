import { Colors, Shadows } from '@/constants';
import { OrderCard } from '@/components/profile/OrderCard';
import { useAuthStore } from '@/store';
import { useOrders } from '@/hooks';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Gift,
} from 'lucide-react-native';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  const processingCount = orders.filter(
    (o) =>
      o.order_status === 'pending' ||
      o.order_status === 'confirmed' ||
      o.order_status === 'processing' ||
      o.order_status === 'shipped',
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.order_status === 'delivered',
  ).length;

  const cancelledCount = orders.filter(
    (o) => o.order_status === 'cancelled' || o.order_status === 'refunded',
  ).length;

  const canAccessDashboard = user?.role === 'admin' || user?.role === 'staff';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#111111', '#1B1814', '#111111']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.memberCard}
        >
          {/* Gold Accent */}
          <LinearGradient
            colors={['#B8860B', '#F5D76E', '#D4AF37', '#B8860B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.goldAccent}
          />
          <View style={styles.patternContainer}>
            <View style={styles.arcOne} />
            <View style={styles.arcTwo} />
            <View style={styles.arcThree} />
          </View>

          <View style={styles.bottomPattern}>
            <View style={styles.bottomArcOne} />
            <View style={styles.bottomArcTwo} />
          </View>

          {/* Brand */}
          <View style={styles.cardHeader}>
            <Text style={styles.brand}>RELOVED GOLD</Text>

            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Gold Member</Text>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <User size={38} color={Colors.gold.DEFAULT} />
            )}
          </View>

          {/* Welcome */}
          <Text style={styles.welcomeText}>Welcome back,</Text>

          <Text style={styles.userName}>{user?.full_name || 'Customer'}</Text>

          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>MEMBER SINCE</Text>

              <Text style={styles.footerValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-PH', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '--'}
              </Text>
            </View>

            <View>
              <Text style={styles.footerLabel}>ORDERS</Text>

              <Text style={styles.footerValue}>{orders.length}</Text>
            </View>
          </View>
        </LinearGradient>

        <Pressable
          style={styles.editProfileButton}
          onPress={() => router.push('/profile/edit')}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* My Order */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Package size={20} color={Colors.gold.DEFAULT} />
          <Text style={styles.sectionTitle}>My Orders</Text>
          <Pressable onPress={() => router.push('/profile/orders')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptySection}>
            <ShoppingBag size={32} color={Colors.text.muted} />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          <>
            <View style={styles.orderStats}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{processingCount}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{deliveredCount}</Text>
                <Text style={styles.statLabel}>Delivered</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{cancelledCount}</Text>
                <Text style={styles.statLabel}>Cancelled</Text>
              </View>
            </View>

            <Text style={styles.recentOrdersTitle}>Recent Orders</Text>

            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/profile/orders/${order.id}`)}
              />
            ))}
          </>
        )}
      </View>

      {/* My Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Collection</Text>

        <View style={styles.quickActionsGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/wishlist')}
          >
            <Heart size={26} color={Colors.gold.DEFAULT} />

            <Text style={styles.actionTitle}>Wishlist</Text>

            <Text style={styles.actionSubtitle}>Saved jewelry</Text>

            <ChevronRight
              size={18}
              color={Colors.text.muted}
              style={styles.actionArrow}
            />
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => {
              // TODO: Customer address screen
            }}
          >
            <MapPin size={26} color={Colors.gold.DEFAULT} />

            <Text style={styles.actionTitle}>Addresses</Text>

            <Text style={styles.actionSubtitle}>Shipping info</Text>

            <ChevronRight
              size={18}
              color={Colors.text.muted}
              style={styles.actionArrow}
            />
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => {
              // TODO: Account settings
            }}
          >
            <Settings size={26} color={Colors.gold.DEFAULT} />

            <Text style={styles.actionTitle}>Settings</Text>

            <Text style={styles.actionSubtitle}>Preferences</Text>

            <ChevronRight
              size={18}
              color={Colors.text.muted}
              style={styles.actionArrow}
            />
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => Alert.alert('Be ready for more.')}
          >
            <Gift size={26} color={Colors.gold.DEFAULT} />

            <Text style={styles.actionTitle}>Rewards</Text>

            <Text style={styles.actionSubtitle}>Coming Soon</Text>

            <ChevronRight
              size={18}
              color={Colors.text.muted}
              style={styles.actionArrow}
            />
          </Pressable>
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        {canAccessDashboard && (
          <Pressable
            style={styles.accountCard}
            onPress={() => router.push('/admin')}
          >
            <Settings size={22} color={Colors.gold.DEFAULT} />

            <View style={styles.accountContent}>
              <Text style={styles.accountTitle}>Admin Dashboard</Text>
              <Text style={styles.accountSubtitle}>
                Manage products & orders
              </Text>
            </View>

            <ChevronRight size={18} color={Colors.text.muted} />
          </Pressable>
        )}

        <Pressable
          style={styles.accountCard}
          onPress={() => {
            // TODO: Edit Profile
          }}
        >
          <User size={22} color={Colors.gold.DEFAULT} />

          <View style={styles.accountContent}>
            <Text style={styles.accountTitle}>Edit Profile</Text>
            <Text style={styles.accountSubtitle}>
              Update your personal information
            </Text>
          </View>

          <ChevronRight size={18} color={Colors.text.muted} />
        </Pressable>

        <Pressable style={styles.accountCard} onPress={handleSignOut}>
          <LogOut size={22} color={Colors.status.error} />

          <View style={styles.accountContent}>
            <Text style={styles.signOutTitle}>Sign Out</Text>
            <Text style={styles.accountSubtitle}>
              Securely sign out of your account
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>RELOVED GOLD</Text>

        <Text style={styles.footerTagline}>Crafted to Shine</Text>

        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
      <View style={{ height: 50 }} />
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
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  memberCard: {
    width: '100%',

    borderRadius: 28,

    paddingHorizontal: 24,
    paddingVertical: 24,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,.08)',
    borderTopColor: 'rgba(212,175,55,.35)',

    shadowColor: '#000',

    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 16,
    },

    elevation: 16,
  },
  goldAccent: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    height: 4,

    backgroundColor: Colors.gold.DEFAULT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  patternContainer: {
    position: 'absolute',

    right: -30,
    top: -10,

    opacity: 0.08,
  },

  arcOne: {
    width: 180,
    height: 180,

    borderRadius: 90,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },

  arcTwo: {
    position: 'absolute',

    top: 24,
    left: 24,

    width: 130,
    height: 130,

    borderRadius: 65,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },

  arcThree: {
    position: 'absolute',

    top: 48,
    left: 48,

    width: 80,
    height: 80,

    borderRadius: 40,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },
  bottomPattern: {
    position: 'absolute',

    left: -70,
    bottom: -70,

    opacity: 0.05,
  },
  bottomArcOne: {
    width: 170,
    height: 170,

    borderRadius: 85,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },
  bottomArcTwo: {
    position: 'absolute',

    top: 30,
    left: 30,

    width: 110,
    height: 110,

    borderRadius: 55,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 30,
  },
  brand: {
    fontFamily: 'CormorantGaramond_700Bold',

    fontSize: 24,

    letterSpacing: 4,

    color: Colors.gold.DEFAULT,
  },
  memberBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: 'rgba(212,175,55,.12)',

    borderWidth: 1,

    borderColor: 'rgba(212,175,55,.25)',
  },
  memberBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.gold.DEFAULT,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  editProfileButton: {
    alignSelf: 'center',

    marginTop: 18,

    paddingHorizontal: 28,
    paddingVertical: 12,

    borderRadius: 999,

    borderWidth: 1,

    borderColor: Colors.gold.DEFAULT,
  },

  editProfileText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.gold.DEFAULT,
  },
  avatarContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,

    backgroundColor: Colors.surface,

    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,

    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },
  userName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
    marginBottom: 20,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,.15)',
    marginTop: 22,
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.text.muted,
  },

  footerValue: {
    marginTop: 4,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: Colors.gold.DEFAULT,
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
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  statCard: {
    flex: 1,

    backgroundColor: Colors.surface,

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: 'center',

    marginHorizontal: 4,

    borderWidth: 1,
    borderColor: 'rgba(212,175,55,.10)',

    ...Shadows.md,
  },

  statNumber: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 30,
    color: Colors.gold.DEFAULT,
  },

  statLabel: {
    marginTop: 4,

    fontFamily: 'Inter_500Medium',
    fontSize: 12,

    color: Colors.text.secondary,
  },
  recentOrdersTitle: {
    marginBottom: 14,

    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,

    color: Colors.text.primary,
  },
  orderCard: {
    backgroundColor: Colors.surface,

    borderRadius: 18,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: 'rgba(212,175,55,.08)',

    ...Shadows.md,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionCard: {
    width: '48%',

    backgroundColor: Colors.surface,

    borderRadius: 22,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: 'rgba(212,175,55,.10)',

    ...Shadows.md,
  },

  actionTitle: {
    marginTop: 18,

    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 22,

    color: Colors.text.primary,
  },

  actionSubtitle: {
    marginTop: 4,

    fontFamily: 'Inter_400Regular',
    fontSize: 13,

    color: Colors.text.secondary,
  },

  actionArrow: {
    position: 'absolute',

    top: 16,
    right: 16,
  },
  accountCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: Colors.surface,

    borderRadius: 20,

    padding: 18,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: 'rgba(212,175,55,.08)',

    ...Shadows.md,
  },

  accountContent: {
    flex: 1,
    marginLeft: 16,
  },

  accountTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },

  signOutTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: Colors.status.error,
  },

  accountSubtitle: {
    marginTop: 2,

    fontFamily: 'Inter_400Regular',
    fontSize: 13,

    color: Colors.text.secondary,
  },
  footer: {
    alignItems: 'center',

    paddingVertical: 40,
  },

  footerBrand: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 18,

    letterSpacing: 3,

    color: Colors.gold.DEFAULT,
  },

  footerTagline: {
    marginTop: 6,

    fontFamily: 'Inter_400Regular',
    fontSize: 13,

    color: Colors.text.secondary,
  },

  footerVersion: {
    marginTop: 10,

    fontFamily: 'Inter_400Regular',
    fontSize: 12,

    color: Colors.text.muted,
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
