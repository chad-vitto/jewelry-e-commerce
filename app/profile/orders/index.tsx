import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';

import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/profile/OrderCard';
import { Colors } from '@/constants';

export default function OrdersScreen() {
  const {
    orders,
    isLoading,
    error,
  } = useOrders();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.gold.DEFAULT}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No orders yet.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Orders',
        }}
      />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() =>
              router.push(`/profile/orders/${item.id}`)
            }
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});