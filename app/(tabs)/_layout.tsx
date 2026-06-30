import { Colors } from '@/constants';
import {
  ColorValue,
  Platform,
  StyleSheet,
  Text,
  View
  } from 'react-native';
import { Tabs } from 'expo-router';
import { useCartStore } from '@/store';
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  ShoppingCart,
} from 'lucide-react-native';

export default function TabLayout() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const ICON_SIZE = 26;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarItemStyle: {
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 21,
          bottom: 16,

          height: Platform.OS === 'ios' ? 68 : 65,

          backgroundColor: Colors.surface,

          borderRadius: 30,

          borderTopWidth: 0,

          elevation: 12,

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },

        tabBarActiveTintColor: Colors.gold.DEFAULT,
        tabBarInactiveTintColor: Colors.text.muted,

        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIconWrapper focused={focused}>
              <Home size={ICON_SIZE} color={color} />
            </TabIconWrapper>
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused, color }) => (
            <TabIconWrapper focused={focused}>
              <ShoppingBag size={ICON_SIZE} color={color} />
            </TabIconWrapper>
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ focused, color }) => (
            <TabIconWrapper focused={focused}>
              <Heart size={ICON_SIZE} color={color} />
            </TabIconWrapper>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarStyle: {
            display: 'none',
          },
          tabBarIcon: ({ focused, color }) => (
            <TabIconWrapper focused={focused}>
              <CartIcon size={ICON_SIZE} color={color} count={itemCount} />
            </TabIconWrapper>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIconWrapper focused={focused}>
              <User size={ICON_SIZE} color={color} />
            </TabIconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIconWrapper({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.iconContainer, focused && styles.activePill]}>
      {children}
    </View>
  );
}

function CartIcon({
  size,
  color,
  count,
}: {
  size: number;
  color: ColorValue;
  count: number;
}) {
  return (
    <View>
      <ShoppingCart size={size} color={color} />

      {count > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 68,
    height: 48,

    justifyContent: 'center',
    alignItems: 'center',

    transform: [{ translateY: 14 }],

    borderRadius: 56,
  },

  activePill: {
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 0,
    borderColor: 'rgba(212, 175, 55, 0.30)',
    position: 'absolute',
    //bottom: 0, // pushes the active icon up
  },

  cartBadge: {
    position: 'absolute',
    right: -10,
    top: -6,

    backgroundColor: Colors.gold.DEFAULT,

    minWidth: 18,
    height: 18,

    borderRadius: 9,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: '#000',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
});
