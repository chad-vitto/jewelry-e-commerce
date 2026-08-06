import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, formatCurrency } from '@/constants';
import { Image } from 'expo-image';
import { CustomerOrderItem } from '@/types';

interface OrderItemCardProps {
  item: CustomerOrderItem;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
  const imageUri =
    item.products?.product_images?.[0]?.image_url ||
    'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg';

  const subtotal = item.price_php * item.quantity;

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.itemImage} contentFit="cover" />
      </View>

      {/* CONTENT */}
      <View style={styles.itemContent}>
        {/* Title */}
        <Text style={styles.itemName} numberOfLines={1}>
          {item.product_name}
        </Text>

        {/* Specs */}
        <Text style={styles.itemSpecs}>
          {item.products?.gold_purity}
        </Text>
        {item.products?.weight_grams && (
          <Text style={styles.itemSpecs}>{item.products.weight_grams} g</Text>
        )}

        {/* Footer: Qty + Price */}
        <View style={styles.itemFooter}>
          <Text style={styles.quantity}>Qty {item.quantity}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(subtotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    backgroundColor: Colors.surfaceLight,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemSpecs: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantity: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
  },
  itemPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.text.primary,
  },
});
