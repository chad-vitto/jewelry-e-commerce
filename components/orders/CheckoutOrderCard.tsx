import React from 'react';
import { Image } from 'expo-image';
import { formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import {
  ShoppingCart,
  Crown,
  Scale,
  Package,
} from 'lucide-react-native';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

interface CheckoutCartItem {
  quantity: number;
  product: {
    id: string;
    name: string;
    description?: string | null;
    price_php: number;
    gold_purity?: string | null;
    weight_grams?: number | null;
    product_images?: {
      image_url: string;
    }[];
  };
}

interface CheckoutOrderCardProps {
  items: CheckoutCartItem[];
  onEditCart: () => void;
}

export function CheckoutOrderCard({
  items,
  onEditCart,
}: CheckoutOrderCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price_php * item.quantity,
    0,
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Items ({items.length})
        </Text>

        <Pressable
          style={styles.editButton}
          onPress={onEditCart}
        >
          <Text style={styles.editText}>
            Edit Cart
          </Text>

          <ShoppingCart
            size={15}
            color={colors.gold.DEFAULT}
          />
        </Pressable>
      </View>

      {/* Products */}
      {items.map((item, index) => {
        const image =
          item.product.product_images?.[0]?.image_url ?? null;

        return (
          <React.Fragment key={item.product.id}>
            <View style={styles.productRow}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.noImageBox}>
                  <Text style={styles.noImageText}>
                    No Image
                  </Text>
                </View>
              )}

              <View style={styles.productInfo}>
                <Text
                  numberOfLines={2}
                  style={styles.productName}
                >
                  {item.product.name}
                </Text>

                <View style={styles.specRow}>
                  {!!item.product.gold_purity && (
                    <View style={styles.specItem}>
                      <Crown
                        size={13}
                        color={colors.gold.DEFAULT}
                      />

                      <Text style={styles.specText}>
                        {item.product.gold_purity}
                      </Text>
                    </View>
                  )}

                  {!!item.product.gold_purity &&
                    !!item.product.weight_grams && (
                      <View style={styles.specDivider} />
                    )}

                  {!!item.product.weight_grams && (
                    <View style={styles.specItem}>
                      <Scale
                        size={13}
                        color={colors.gold.DEFAULT}
                      />

                      <Text style={styles.specText}>
                        {item.product.weight_grams} g
                      </Text>
                    </View>
                  )}
                </View>

                {!!item.product.description && (
                  <Text
                    numberOfLines={2}
                    style={styles.description}
                  >
                    {item.product.description}
                  </Text>
                )}

                <View style={styles.metaRow}>
                  <Text style={styles.qtyText}>
                    Qty × {item.quantity}
                  </Text>

                  {item.quantity > 1 && (
                    <Text style={styles.unitPrice}>
                      {formatCurrency(item.product.price_php)} each
                    </Text>
                  )}
                </View>
              </View>

              <Text style={styles.itemTotal}>
                {formatCurrency(
                  item.product.price_php * item.quantity,
                )}
              </Text>
            </View>

            {index < items.length - 1 && (
              <View style={styles.itemDivider} />
            )}
          </React.Fragment>
        );
      })}

      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.quantityRow}>
          <Package
            size={15}
            color={colors.gold.DEFAULT}
          />

          <Text style={styles.quantity}>
            Total Qty: {totalQuantity}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.totalLabel}>
            Total:
          </Text>

          <Text style={styles.total}>
            {formatCurrency(totalPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.gold.light + '20',
  },

  editText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold.DEFAULT,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },

  productImage: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 14,
  },

  noImageBox: {
    width: 84,
    height: 84,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: colors.border.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noImageText: {
    fontSize: 10,
    color: colors.text.muted,
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: colors.text.primary,
  },

  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  specDivider: {
    width: 1,
    height: 13,
    backgroundColor: colors.border.gold,
    marginHorizontal: 10,
  },

  specText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold.DEFAULT,
  },

  description: {
    marginTop: 6,
    fontSize: 13,
    color: colors.text.secondary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  qtyText: {
    fontSize: 13,
    color: colors.text.secondary,
  },

  unitPrice: {
    fontSize: 12,
    color: colors.text.muted,
  },

  itemTotal: {
    marginLeft: 12,
    alignSelf: 'center',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: colors.gold.DEFAULT,
  },

  itemDivider: {
    height: 1,
    backgroundColor: colors.border.gold,
    opacity: 0.25,
    marginVertical: 12,
  },

  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.gold,
    opacity: 0.4,
    marginVertical: 14,
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
    marginRight: 4,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.text.secondary,
  },

  total: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: colors.gold.DEFAULT,
  },
});
