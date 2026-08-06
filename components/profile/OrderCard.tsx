import { Colors } from '@/constants';
import { CustomerOrderCard } from '@/hooks/useOrders';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

interface OrderCardProps {
  order: CustomerOrderCard;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{
        color: Colors.border.subtle,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.shortId}</Text>
        <Text style={styles.date}>{order.formattedDate}</Text>
      </View>

      {/* Product Preview */}
      <View style={styles.productRow}>
        {order.firstProductImage ? (
          <Image
            source={{ uri: order.firstProductImage }}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <View>
          <Text style={styles.productName}>{order.firstProductName}</Text>
          {order.itemCount > 1 && (
            <Text style={styles.moreItems}>
              +{order.itemCount - 1} more items
            </Text>
          )}
        </View>
      </View>

      {/* Status Badges */}
      <View style={styles.badgesRow}>
        <OrderStatusBadge status={order.order_status} />
        <PaymentStatusBadge status={order.payment_status} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.quantity}>
          Total Quantity: {order.totalQuantity}
        </Text>
        <Text style={styles.total}>{order.formattedTotal}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  noImageBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: Colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noImageText: {
    fontSize: 10,
    color: Colors.text.muted,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  moreItems: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold.DEFAULT,
  },
});
