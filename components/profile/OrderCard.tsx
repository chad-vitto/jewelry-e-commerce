import { CustomerOrderCard } from '@/hooks/useOrders';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, Crown, Scale, CalendarDays, Package } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

interface OrderCardProps {
  order: CustomerOrderCard;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{
        color: colors.border.subtle,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.shortId}</Text>
        <View style={styles.dateContainer}>
          <CalendarDays
            size={14}
            color={colors.gold.DEFAULT}
          />
          <Text style={styles.date}>
            {order.formattedDate}
          </Text>
        </View>
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

        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {order.firstProductName}
          </Text>

          <View style={styles.specRow}>
            {!!order.firstProductKarat && (
              <View style={styles.specItem}>
                <Crown
                  size={13}
                  color={colors.gold.DEFAULT}
                />
                <Text style={styles.specText}>
                  {order.firstProductKarat}
                </Text>
              </View>
            )}

            {!!order.firstProductKarat && !!order.firstProductWeight && (
              <View style={styles.specDivider} />
            )}

            {!!order.firstProductWeight && (
              <View style={styles.specItem}>
                <Scale
                  size={13}
                  color={colors.gold.DEFAULT}
                />
                <Text style={styles.specText}>
                  {order.firstProductWeight} g
                </Text>
              </View>
            )}
          </View>

          {!!order.firstProductDescription && (
            <Text
              numberOfLines={2}
              style={styles.description}
            >
              {order.firstProductDescription}
            </Text>
          )}

          <View style={styles.badgesRow}>
            <OrderStatusBadge status={order.order_status} />
            <PaymentStatusBadge status={order.payment_status} />
          </View>

          {order.itemCount > 1 && (
            <Text style={styles.moreItems}>
              +{order.itemCount - 1} more items
            </Text>
          )}
        </View>

        <ChevronRight
          size={20}
          color={colors.gold.DEFAULT}
          style={styles.chevron}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />
      <View style={styles.footer}></View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.quantityRow}>
          <Package
            size={15}
            color={colors.gold.DEFAULT}
          />

          <Text style={styles.quantity}>
            Total Qty: {order.totalQuantity}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.totalLabel}>
            Total Amount:
          </Text>

          <Text style={styles.total}>
            {order.formattedTotal}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.gold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.gold.DEFAULT,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold.DEFAULT,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
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
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 84,
  },
  specText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold.DEFAULT,
    letterSpacing: 0.2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.gold,
    marginHorizontal: 10,
  },
  description: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.primary,
  },
  noImageText: {
    fontSize: 10,
    color: colors.text.muted,
  },
  productName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },
  moreItems: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chevron: {
    alignSelf: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    opacity: 0.5,
    marginTop: 2,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
    marginRight: 4,
  },
  total: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: colors.gold.DEFAULT,
  },
});
