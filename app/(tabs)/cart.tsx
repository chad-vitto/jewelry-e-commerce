import React, { useCallback } from 'react';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react-native';
import { CartItem } from '@/types';
import { Colors, formatCurrency, Shadows } from '@/constants';
import { EmptyCart } from '@/components/EmptyState';
import { GoldButton } from '@/components/GoldGradient';
import { Image } from 'expo-image';
import { QuantitySelector } from '@/components';
import { Stack, useRouter } from 'expo-router';
import { useCart } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  RectButton,
} from 'react-native-gesture-handler';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    qualifyForFreeShipping,
    remainingForFreeShipping,
    shippingProgress,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

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
        onUpdateQuantity={(qty) =>
          updateQuantity(item.product.id, qty, item.size)
        }
        onRemove={() => handleRemoveItem(item.product.id, item.size)}
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
            <ArrowLeft size={24} color={Colors.text.primary} />
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
        contentContainerStyle={styles.cartListContent}
        removeClippedSubviews={false}
        initialNumToRender={5}
        windowSize={5}
      />

      {/* Order Summary */}
      {items.length > 0 && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutDown.duration(200)}
          style={[styles.summary, { bottom: insets.bottom + 16 }]}
        >
          <View style={styles.summaryInfo}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </Text>

              <Text style={styles.summaryValue}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>

              <Text style={styles.summaryValue}>
                {qualifyForFreeShipping ? 'FREE' : formatCurrency(shippingFee)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>

              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.checkoutContainer}>
            <GoldButton title="Checkout" onPress={handleCheckout} size="sm" />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItemCard = React.memo(function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
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
    translateX.value = withSpring(0);
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
          onPress={onRemove}
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
                    onIncrease={() => onUpdateQuantity(quantity + 1)}
                    onDecrease={() => onUpdateQuantity(quantity - 1)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
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
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.gold.DEFAULT,
  },
  freeShippingBanner: {
    backgroundColor: Colors.gold.DEFAULT,
    paddingVertical: 12,
    alignItems: 'center',
    ...Shadows.lg,
  },
  freeShippingText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  progressContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border.DEFAULT,
    borderRadius: 2,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 2,
  },
  productArea: {
    flexDirection: 'row',
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    zIndex: 1,
    ...Shadows.md,
  },
  itemImage: {
    width: 100,
    height: 100,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  itemPurity: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.gold.DEFAULT,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  removeButton: {
    padding: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  summary: {
    position: 'absolute',
    left: 12,
    right: 12,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: Colors.surface,
    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 16,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },

    ...Shadows.lg,
  },
  summaryInfo: {
    flex: 1,
    marginRight: 16,
  },

  checkoutContainer: {
    width: 150,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.text.primary,
    ...Shadows.lg,
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.DEFAULT,
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  totalValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.gold.DEFAULT,
  },
  clearText: {
    color: Colors.status.error,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },

  cartListContent: {
    padding: 16,
    paddingBottom: 230,
  },
  unitPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.text.muted,
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  actionButton: {
    width: 77,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    margin: 1,
  },

  similarButton: {
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 16,
  },

  deleteButton: {
    backgroundColor: Colors.status.error,
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
    marginBottom: 12,
    borderRadius: 16,
  },

  actionContainer: {
    ...StyleSheet.absoluteFill,

    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
});
