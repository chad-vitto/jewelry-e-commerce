import { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/profile/OrderCard';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const {
    orders,
    isLoading,
    error,
  } = useOrders();

  const handleOrderPress = useCallback((order: (typeof orders)[number]) => {
    router.push(`/profile/orders/${order.id}`);
  }, [router]);

  const renderOrder = useCallback(({ item }: { item: (typeof orders)[number] }) => (
    <OrderCard order={item} onPress={handleOrderPress} />
  ), [handleOrderPress]);

  const listContent = isLoading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
    </View>
  ) : error ? (
    <View style={styles.center}>
      <Text>{error}</Text>
    </View>
  ) : orders.length === 0 ? (
    <View style={styles.center}>
      <Text>No orders yet.</Text>
    </View>
  ) : (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={renderOrder}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={4}
        >
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>
      {listContent}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
