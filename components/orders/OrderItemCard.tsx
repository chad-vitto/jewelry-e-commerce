import { Colors, formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { Crown, Scale } from 'lucide-react-native';
import { CustomerOrderItem } from '@/types';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface OrderItemCardProps {
  item: CustomerOrderItem;
}

export function OrderItemCard({ item }: OrderItemCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const imageUri =
    item.products?.product_images?.[0]?.image_url ??
    'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg';

  const unitPrice = item.price_php;
  const subtotal = unitPrice * item.quantity;

  return (
    <View style={styles.card}>
      {/* ---------- PRODUCT ---------- */}
      <View style={styles.productRow}>
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          contentFit="cover"
        />

        <View style={styles.productInfo}>
          <View style={styles.topRow}>
            <View style={styles.infoColumn}>
              <Text
                numberOfLines={1}
                style={styles.productName}
              >
                {item.product_name}
              </Text>

              <View style={styles.specRow}>
                {!!item.products?.gold_purity && (
                  <View style={styles.specItem}>
                    <Crown
                      size={13}
                      color={colors.gold.DEFAULT}
                    />
                    <Text style={styles.specText}>
                      {item.products.gold_purity}
                    </Text>
                  </View>
                )}

                {!!item.products?.gold_purity &&
                  !!item.products?.weight_grams && (
                    <View style={styles.specDivider} />
                  )}

                {!!item.products?.weight_grams && (
                  <View style={styles.specItem}>
                    <Scale
                      size={13}
                      color={colors.gold.DEFAULT}
                    />
                    <Text style={styles.specText}>
                      {item.products.weight_grams} g
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.priceColumn}>
              <Text style={styles.heroPrice}>
                {formatCurrency(subtotal)}
              </Text>
            </View>
          </View>

          {!!item.products?.description && (
            <Text
              numberOfLines={3}
              style={styles.description}
            >
              {item.products.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* ---------- RECEIPT ---------- */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>
            Quantity
          </Text>

          <Text style={styles.value}>
            × {item.quantity}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>
            Unit Price
          </Text>

          <Text style={styles.value}>
            {formatCurrency(unitPrice)}
          </Text>
        </View>

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>
            Subtotal
          </Text>

          <Text style={styles.subtotalValue}>
            {formatCurrency(subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.gold,
    padding: 12,
    marginBottom: 12,
  },

  /* ---------------- Product ---------------- */

  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  productImage: {
    width: 96,
    height: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.gold,
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 96,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  infoColumn: {
    flex: 1,
    paddingRight: 10,
  },

  priceColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 88,
  },

  heroPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.text.primary,
  },

  productName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 26,
    color: colors.text.primary,
    marginBottom: 2,
  },

  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.gold,
    opacity: 0.5,
    marginHorizontal: 8,
  },

  specText: {
    marginLeft: 4,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.gold.DEFAULT,
  },

  description: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },

  /* ---------------- Divider ---------------- */

  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    opacity: 0.25,
    marginTop: 10,
    marginBottom: 8,
  },

  /* ---------------- Receipt ---------------- */

  summary: {
    gap: 6,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 22,
  },

  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
  },

  value: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.text.primary,
  },

  subtotalRow: {
    marginTop: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212,175,55,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subtotalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.gold.DEFAULT,
  },

  subtotalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.gold.DEFAULT,
  },
});
