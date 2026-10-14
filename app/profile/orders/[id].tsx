import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, CreditCard, MessageCircle, Package, PackageX, Receipt } from 'lucide-react-native';
import { formatCurrency, PAYMENT_METHODS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { OrderHeroCard } from '@/components/orders/OrderHeroCard';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { PaymentProofCard } from '@/components/orders/PaymentProofCard';
import { PaymentProofStatus, usePaymentProofs } from '@/hooks/usePaymentProofs';
import { PaymentReferenceInput } from '@/components/orders/PaymentReferenceInput';
import { PaymentStatusBadge } from '@/components';
import { PaymentStatusCard } from '@/components/orders/PaymentStatusCard';
import { SectionCard } from '@/components/orders/SectionCard';
import { ShippingAddressCard } from '@/components/orders/ShippingAddressCard';
import { ShippingInfoCard } from '@/components/orders/ShippingInfoCard';
import { UploadProofButton } from '@/components/orders/UploadProofButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrder } from '@/hooks/useOrders';
import { usePaymentProof } from '@/hooks/usePaymentProof';
import { useState } from 'react';
import { Alert, Text, ScrollView, StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';


export default function OrderDetailScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, isLoading, error, refetch } = useOrder(id);
  const [isCancelling, setIsCancelling] = useState(false);

  const [draftReferenceNumber, setDraftReferenceNumber] = useState<string | null>(null);

  const { uploadReceipt, submitProof, updateProof } = usePaymentProofs();
  const { paymentProof, loading: paymentProofLoading, refresh: refreshPaymentProof, } = usePaymentProof(id);
  const referenceNumber = draftReferenceNumber ?? paymentProof?.reference_number ?? '';
  const hasReferenceNumber = referenceNumber.trim().length > 0;

  const handleUploadPress = async () => {

    if (order?.order_status === 'cancelled') {
      return;
    }
    if (!hasReferenceNumber) {
      Alert.alert(
        'Reference number required',
        'Enter your payment reference number before uploading a receipt.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      const asset = result.assets[0];

      const { storagePath, uploadedBy } = await uploadReceipt(asset, orderId);

      if (paymentProof) {
        await updateProof(paymentProof.id, {
          storage_path: storagePath,
          reference_number: referenceNumber.trim() || null,
          status: PaymentProofStatus.Submitted,
          rejection_reason: null,
          verified_at: null,
          verified_by: null,
        });
      } else {
        await submitProof({
          order_id: orderId,
          storage_path: storagePath,
          reference_number: referenceNumber.trim() || null,
          uploaded_by: uploadedBy,
        });
      }
      await refreshPaymentProof();
      setDraftReferenceNumber(null);
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading order...</Text>
      </View>
    );
  }
  if (error || !order) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Order not found</Text>
      </View>
    );
  }

  const orderId = order.id;
  const shippingAddress = order.shipping_address;
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === order.payment_method);
  const canCancelOrder = order.order_status === 'pending' || order.order_status === 'confirmed';
  const isOrderCancelled = order.order_status === 'cancelled';

  const handleOpenMap = () => { // TODO: Open Google Maps / Apple Maps
  };

  const confirmCancelOrder = () => {
    Alert.alert(
      'Cancel Order?',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        {
          text: 'Keep Order',
          style: 'cancel',
        },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: handleCancelOrder,
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setIsCancelling(true);

      const { error: cancelError } = await supabase.rpc('cancel_order', {
        p_order_id: order.id,
      });

      if (cancelError) {
        throw cancelError;
      }

      await refetch();
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Floating Back Button */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <OrderHeroCard order={order} />

          {/* Timeline */}
          <OrderTimeline
            orderStatus={order.order_status}
            paymentStatus={paymentProof?.status ?? PaymentProofStatus.Pending}
            orderPaymentStatus={order.payment_status}
            timestamps={{
              pending: order.created_at,
              confirmed: paymentProof?.verified_at ?? undefined,
              processing: order.processing_at ?? undefined,
              shipped: order.shipped_at ?? undefined,
              delivered: order.delivered_at ?? undefined,
              refunded:
                order.payment_status === 'refunded'
                  ? order.updated_at
                  : undefined,
            }}
          />

          {/* Items */}
          <SectionCard
            title={`Items (${order.itemCount})`}
            icon={<Package size={18} color={colors.gold.DEFAULT} />}
          >
            {order.order_items?.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </SectionCard>

          {/* Shipping Address */}
          <ShippingAddressCard
            address={shippingAddress}
            onPressMap={handleOpenMap}
            style={{
              backgroundColor: ''
            }} />

          {/* Payment */}
          <SectionCard
            title="Payment"
            icon={<CreditCard size={18} color={colors.gold.DEFAULT} />}
          >
            <PaymentStatusBadge
              status={order.payment_status}
            />
            <PaymentStatusCard
              status={paymentProof?.status ?? PaymentProofStatus.Pending}
              paymentMethod={paymentMethod?.name}
              referenceNumber={paymentProof?.reference_number ?? undefined}
              uploadedAt={paymentProof?.uploaded_at}
              verifiedAt={paymentProof?.verified_at ?? undefined}
              rejectionReason={paymentProof?.rejection_reason ?? undefined}
            />

            {!isOrderCancelled &&
              paymentProof?.status !== PaymentProofStatus.Verified && (
                <PaymentReferenceInput
                  value={referenceNumber}
                  onChangeText={setDraftReferenceNumber}
                  editable
                />
              )}

            {paymentProof ? (
              <PaymentProofCard
                paymentProof={paymentProof}
                loading={paymentProofLoading}
                onReplace={handleUploadPress}
                canReplace={!isOrderCancelled}
              />
            ) : (
              !isOrderCancelled && (
                <UploadProofButton
                  onUploadPress={handleUploadPress}
                  loading={paymentProofLoading}
                />
              )
            )}

            {paymentMethod && (
              <>
                <Text style={styles.text}>{paymentMethod.name}</Text>
                <Text style={styles.text}>Account: {paymentMethod.accountNumber}</Text>
                <Text style={styles.text}>Name: {paymentMethod.accountName}</Text>
              </>
            )}
            {order.payment_reference && (
              <Text style={styles.text}>Reference: {order.payment_reference}</Text>
            )}
          </SectionCard>

          {/* Shipping Info Card */}
          <SectionCard
            title='Shipping'
            icon={<Package size={18} color={colors.gold.DEFAULT} />}>
            <ShippingInfoCard order={order} />
          </SectionCard>

          {/* Summary */}
          <SectionCard
            title="Summary"
            icon={<Receipt size={18} color={colors.gold.DEFAULT} />}
          >
            <View style={styles.summaryRow}>
              <Text style={styles.text}>Subtotal</Text>
              <Text style={styles.text}>{formatCurrency(order.subtotal_php)}</Text>
            </View>

            {order.discount_amount_php > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.text}>{order.promotion_title ?? 'Discount'}</Text>
                <Text style={styles.discountValue}>
                  -{formatCurrency(order.discount_amount_php)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.text}>Shipping</Text>
              <Text style={styles.text}>{order.shipping_fee_php === 0
                ? 'FREE'
                : formatCurrency(order.shipping_fee_php)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{order.formattedTotal}</Text>
            </View>
          </SectionCard>

          {/* Order Actions */}
          {canCancelOrder && (
            <SectionCard
              title="Order Actions"
              icon={<PackageX size={18} color={colors.status.error} />}
            >
              <TouchableOpacity
                style={styles.cancelOrderButton}
                onPress={confirmCancelOrder}
                disabled={isCancelling}
                activeOpacity={0.75}
              >
                <PackageX size={22} color={colors.status.error} />

                <View style={styles.cancelOrderContent}>
                  <Text style={styles.cancelOrderLabel}>Cancel Order</Text>
                  <Text style={styles.cancelOrderHint}>
                    Cancellation is only available until order processing begins.
                  </Text>
                </View>
              </TouchableOpacity>
            </SectionCard>
          )}

          {/* Support */}
          <SectionCard
            title="Need Help?"
            icon={<MessageCircle size={18} color={colors.status.info} />}
          >
            <TouchableOpacity style={styles.supportRow}>
              <Text style={styles.supportLink}>Contact Support</Text>
            </TouchableOpacity>
          </SectionCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },

  header: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.text.secondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.text.primary,
  },
  discountValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.gold.DEFAULT,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.gold.muted,
    marginTop: 16,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: colors.gold.DEFAULT,
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.error + '40',
    backgroundColor: colors.status.error + '08',
  },

  cancelOrderContent: {
    flex: 1,
  },

  cancelOrderLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.status.error,
    marginBottom: 3,
  },

  cancelOrderHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: colors.text.secondary,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  supportLink: {
    fontSize: 14,
    color: colors.status.info,
    fontWeight: '600',
    marginLeft: 4,
  },
});

