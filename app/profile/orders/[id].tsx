import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  MessageCircle,
  Package,
  Receipt
  } from 'lucide-react-native';
import { Colors, formatCurrency, PAYMENT_METHODS } from '@/constants';
import { OrderHeroCard } from '@/components/orders/OrderHeroCard';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { PaymentProofCard } from '@/components/orders/PaymentProofCard';
import { PaymentProofStatus, usePaymentProofs } from '@/hooks/usePaymentProofs';
import { PaymentReferenceInput } from '@/components/orders/PaymentReferenceInput';
import { PaymentStatusBadge } from '@/components';
import { PaymentStatusCard } from '@/components/orders/PaymentStatusCard';
import { SectionCard } from '@/components/orders/SectionCard';
import { UploadProofButton } from '@/components/orders/UploadProofButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrder } from '@/hooks/useOrders';
import { usePaymentProof } from '@/hooks/usePaymentProof';
import { useState } from 'react';

import { 
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';


export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, isLoading, error } = useOrder(id);
  const [draftReferenceNumber, setDraftReferenceNumber] = useState<string | null>(null);

  const { uploadReceipt, submitProof, updateProof } = usePaymentProofs();
  const { paymentProof, loading: paymentProofLoading, refresh: refreshPaymentProof, } = usePaymentProof(id);
  const referenceNumber = draftReferenceNumber ?? paymentProof?.reference_number ?? '';

  const handleUploadPress = async () => {
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

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OrderHeroCard order={order} />

        {/* Timeline */}
        <OrderTimeline
          orderStatus={order.order_status}
          paymentStatus={paymentProof?.status ?? PaymentProofStatus.Pending} />

        {/* Items */}
        <SectionCard
          title={`Items (${order.itemCount})`}
          icon={<Package size={18} color={Colors.gold.DEFAULT} />}
        >
          {order.order_items?.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
        </SectionCard>

        {/* Shipping Address */}
        <SectionCard
          title="Shipping Address"
          icon={<MapPin size={18} color={Colors.gold.DEFAULT} />}
        >
          {shippingAddress ? (
            <>
              <Text style={styles.text}>{shippingAddress.full_name}</Text>
              <Text style={styles.text}>{shippingAddress.phone_number}</Text>
              <Text style={styles.text}>{shippingAddress.address_line1}</Text>
              {shippingAddress.address_line2 && (
                <Text style={styles.text}>{shippingAddress.address_line2}</Text>
              )}
              <Text style={styles.text}>
                {shippingAddress.city}, {shippingAddress.province}
              </Text>
              <Text style={styles.text}>{shippingAddress.postal_code}</Text>
            </>
          ) : (
            <Text style={styles.text}>No shipping address found</Text>
          )}
        </SectionCard>

        {/* Payment */}
        <SectionCard
          title="Payment"
          icon={<CreditCard size={18} color={Colors.gold.DEFAULT} />}
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
          {paymentProof?.status !== PaymentProofStatus.Verified && (
            <PaymentReferenceInput
              value={referenceNumber}
              onChangeText={setDraftReferenceNumber}
              editable
            />)}

          {paymentProof ? (
            <PaymentProofCard
              paymentProof={paymentProof}
              loading={paymentProofLoading}
              onReplace={handleUploadPress}
            />
          ) : (
            <UploadProofButton
              onUploadPress={handleUploadPress}
              loading={paymentProofLoading}
            />
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

        {/* Summary */}
        <SectionCard
          title="Summary"
          icon={<Receipt size={18} color={Colors.gold.DEFAULT} />}
        >
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Subtotal</Text>
            <Text style={styles.text}>{formatCurrency(order.subtotal_php)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Shipping</Text>
            <Text style={styles.text}>{formatCurrency(order.shipping_fee_php)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.formattedTotal}</Text>
          </View>
        </SectionCard>

        {/* Support */}
        <SectionCard
          title="Need Help?"
          icon={<MessageCircle size={18} color={Colors.status.info} />}
        >
          <TouchableOpacity style={styles.supportRow}>
            <Text style={styles.supportLink}>Contact Support</Text>
          </TouchableOpacity>
        </SectionCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 24 },

  header: {
    position: 'absolute',
    top: 20, // adjust for safe area
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

  text: { fontSize: 14, color: Colors.text.primary, marginBottom: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  totalValue: { fontSize: 16, fontWeight: '700', color: Colors.gold.DEFAULT },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  supportLink: {
    fontSize: 14,
    color: Colors.status.info,
    fontWeight: '600',
    marginLeft: 4,
  },
});

