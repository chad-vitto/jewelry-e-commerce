import React, { useCallback, useState } from 'react';
import { CartItem } from '@/types';
import { ChevronLeft, Heart, TicketPercent, Trash2 } from 'lucide-react-native';
import { EmptyCart } from '@/components/EmptyState';
import { formatCurrency, Shadows } from '@/constants';
import { GoldButton } from '@/components/GoldGradient';
import { Image } from 'expo-image';
import { QuantitySelector } from '@/components';
import { scheduleOnUI } from 'react-native-worklets';
import { Stack, useRouter } from 'expo-router';
import { useAuth, useCart } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import Animated, { FadeInUp, FadeOutDown, useAnimatedStyle, useSharedValue, withSpring, } from 'react-native-reanimated';
import { Gesture, GestureDetector, RectButton, } from 'react-native-gesture-handler';
import { Alert, FlatList, Pressable, StyleSheet, Text, View, } from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    discountAmount,
    activePromotion,
    total,
    qualifyForFreeShipping,
    remainingForFreeShipping,
    shippingProgress,
    updateQuantity,
    removeItem,
    clearCart,
    promotions,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [summaryHeight, setSummaryHeight] = useState(0);

  const handleOpenPromotions = useCallback(() => {
    router.push('/promotions');
  }, [router]);

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    router.push('/checkout');
  }, [isAuthenticated, router]);

  const handleClearCart = useCallback(() => {
    Alert.alert('Clear Cart', 'Remove all items from the cart', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  }, [clearCart]);

  const handleRemoveItem = useCallback(
    (productId: string, size?: string) => {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeItem(productId, size),
          },
        ],
      );
    },
    [removeItem],
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemCard
        item={item}
        onUpdateQuantity={updateQuantity}
        onRemove={handleRemoveItem}
      />
    ),
    [updateQuantity, handleRemoveItem],
  );

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyCart onBrowse={() => router.push('/shop')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={styles.headerLeft}>
          <Pressable
            hitSlop={10}
            onPress={() =>
              router.replace({
                pathname: '/shop',
                params: { category: 'all' },
              })
            }
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </Pressable>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            <Text style={styles.headerSubtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <Pressable onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      {/* Free Shipping Progress */}
      {qualifyForFreeShipping ? (
        <View style={styles.freeShippingBanner}>
          <Text style={styles.freeShippingText}>
            You qualify for FREE shipping!
          </Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Add {formatCurrency(remainingForFreeShipping)} more for FREE
            shipping
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${shippingProgress}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.product.id}-${item.size || 'no-size'}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.cartListContent, { paddingBottom: summaryHeight + insets.bottom + 28 },]}
        removeClippedSubviews={false}
        initialNumToRender={5}
        windowSize={5}
        ListHeaderComponent={null}
      />

      {/* Promotion Banner + Order Summary */}
      {items.length > 0 && (
        <View
          onLayout={(e) => setSummaryHeight(e.nativeEvent.layout.height)}
          style={[
            styles.bottomSection,
            { bottom: insets.bottom + 4 },
          ]}
        >
          {promotions.length > 0 && (
            <Pressable
              onPress={handleOpenPromotions}
              style={styles.promotionSummary}
            >
              <View style={styles.promotionIconContainer}>
                <TicketPercent size={20} color={colors.gold.DEFAULT} />
              </View>

              <View style={styles.promotionSummaryContent}>
                <Text style={styles.promotionSummaryTitle}>
                  {activePromotion ? activePromotion.title : 'Discounts & offers'}
                </Text>

                <Text style={styles.promotionSummarySubtitle}>
                  {activePromotion
                    ? `You're saving ${formatCurrency(discountAmount)}`
                    : `${promotions.length} ${promotions.length === 1 ? 'offer' : 'offers'} available`}
                </Text>
              </View>

              <Text style={styles.promotionChangeText}>
                {activePromotion ? 'Change' : 'View'}
              </Text>
            </Pressable>
          )}
          <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutDown.duration(200)}
            style={styles.summary}
          >
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </Text>

                <Text style={styles.summaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              {activePromotion && discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {activePromotion.title}
                  </Text>
                  <Text style={styles.discountValue}>
                    -{formatCurrency(discountAmount)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>

                <Text style={styles.summaryValue}>
                  {qualifyForFreeShipping ? 'FREE' : formatCurrency(shippingFee)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>

                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <GoldButton
              title="Proceed to Checkout"
              onPress={handleCheckout}
              size="lg"
            />

            <Text style={styles.secureText}>🔒 Secure Checkout</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number, size?: string) => void;
  onRemove: (productId: string, size?: string) => void;
}

const CartItemCard = React.memo(function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { product, quantity, size } = item;
  const unitPrice = product.price_php;
  const subtotal = unitPrice * quantity;
  const router = useRouter();

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      translateX.value = Math.min(
        0,
        Math.max(startX.value + e.translationX, -160),
      );
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value < -80 ? -160 : 0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const goToProduct = () => {
    router.push(`/products/${product.id}`);
  };

  const goToSimilarProducts = () => {
    scheduleOnUI(() => {
      'worklet';
      translateX.value = withSpring(0);
    });
    router.push({
      pathname: '/(tabs)/shop',
      params: {
        category: product.category,
      },
    });
  };

  const imageUri =
    product.product_images?.[0]?.image_url ||
    'https://images.pexels.com/photos/269228/pexels-photo-269228.jpeg?auto=compress&cs=tinysrgb&w=200';

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.actionContainer}>
        <RectButton
          style={[styles.actionButton, styles.similarButton]}
          onPress={goToSimilarProducts}
        >
          <Heart size={20} color="white" />
          <Text style={styles.actionText}>Similar</Text>
        </RectButton>

        <RectButton
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onRemove(product.id, size)}
        >
          <Trash2 size={20} color="white" />
          <Text style={styles.actionText}>Delete</Text>
        </RectButton>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>
          <View style={styles.cartItem}>
            <Pressable onPress={goToProduct} style={styles.productArea}>
              {/* IMAGE */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.itemImage}
                  contentFit="cover"
                />
              </View>

              {/* CONTENT */}
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {product.name}
                    </Text>

                    <Text style={styles.itemPurity}>
                      {product.gold_purity}
                      {product.weight_grams
                        ? ` • ${product.weight_grams}g`
                        : ''}
                      {size ? ` • Size ${size}` : ''}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemFooter}>
                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={() => onUpdateQuantity(product.id, quantity + 1, size)}
                    onDecrease={() => onUpdateQuantity(product.id, quantity - 1, size)}
                    min={1}
                    max={product.stock_quantity}
                    size="sm"
                  />

                  <View style={styles.priceContainer}>
                    {quantity > 1 && (
                      <Text style={styles.unitPrice}>
                        {formatCurrency(unitPrice)} × {quantity}
                      </Text>
                    )}
                    <Text style={styles.itemPrice}>
                      {formatCurrency(subtotal)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.gold.DEFAULT,
  },
  freeShippingBanner: {
    backgroundColor: colors.gold.DEFAULT,
    paddingVertical: 12,
    alignItems: 'center',
    ...Shadows.lg,
  },
  freeShippingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.DEFAULT,
    borderRadius: 2,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 2,
  },
  productArea: {
    flexDirection: 'row',
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
    zIndex: 1,
    ...Shadows.md,
  },
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemPurity: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.gold.DEFAULT,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.text.primary,
  },
  bottomSection: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 6,
  },
  summary: {
    position: 'relative',
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    ...Shadows.lg,
  },
  summaryTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  summaryContent: {
    width: '100%',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.DEFAULT,
    marginVertical: 6,
  },
  secureText: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.text.muted,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
    ...Shadows.lg,
  },
  discountValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 8,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.text.primary,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: colors.gold.DEFAULT,
  },
  clearText: {
    color: colors.status.error,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  cartListContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  promotionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
  },
  promotionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    marginRight: 10,
  },
  promotionSummaryContent: {
    flex: 1,
    marginRight: 8,
  },
  promotionSummaryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
  },
  promotionSummarySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.gold.muted,
    marginTop: 4,
  },
  promotionChangeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.gold.DEFAULT,
  },
  promotionSection: {
    marginBottom: 16,
  },
  promotionTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 2,
  },
  promotionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  promotionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
  },
  promotionOptionSelected: {
    borderColor: colors.gold.DEFAULT,
    backgroundColor: colors.gold.muted,
  },
  promotionOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  promotionOptionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text.primary,
  },
  promotionOptionMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 3,
  },
  promotionDiscountText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.gold.DEFAULT,
    marginTop: 5,
  },
  promotionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionRadioSelected: {
    borderColor: colors.gold.DEFAULT,
  },
  promotionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold.DEFAULT,
  },
  promotionEmptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.text.secondary,
    paddingVertical: 12,
  },
  unitPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  backButton: {
    marginRight: 8,
    padding: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    elevation: 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButton: {
    width: 77,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    margin: 1,
  },

  similarButton: {
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 16,
  },

  deleteButton: {
    backgroundColor: colors.status.error,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  actionText: {
    color: '#fff',
    marginTop: 4,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },

  swipeContainer: {
    marginBottom: 6,
    borderRadius: 16,
  },

  actionContainer: {
    ...StyleSheet.absoluteFill,

    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
});
