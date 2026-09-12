import Toast from 'react-native-toast-message';
import { AdminPaymentCard } from '@/components/admin/AdminPaymentCard';
import { AdminReceiptViewer } from '@/components/admin/AdminReceiptViewer';
import { Colors, formatCurrency, PAYMENT_METHODS } from '@/constants';
import { FulfillmentActions } from '@/components/admin/FulfillmentActions';
import { OrderHeroCard } from '@/components/orders/OrderHeroCard';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { PaymentVerificationActions } from '@/components/admin/PaymentVerificationActions';
import { RejectionReasonModal } from '@/components/admin/RejectionReasonModal';
import { SectionCard } from '@/components/orders/SectionCard';
import { ShippingInfoCard } from '@/components/orders/ShippingInfoCard';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrder } from '@/hooks/useOrders';
import { usePaymentProofImage } from '@/hooks/usePaymentProofImage';
import {
    ArrowLeft,
    CreditCard, Package,
    Receipt,
    Truck
} from 'lucide-react-native';
import {
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
    View,
    ActivityIndicator
} from 'react-native';
import { OrderStatus, PaymentProofStatus, type PaymentProof } from '@/types';
import { ShippingAddressCard } from '@/components/orders/ShippingAddressCard';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export default function AdminOrderDetailScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);
    const [receiptVisible, setReceiptVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    const { order, isLoading, error, refetch: refetchOrder } = useOrder(id);
    const {
        getPaymentProof,
        verifyPayment,
        rejectPayment,
        loading: paymentLoading,
        error: paymentError,
    } = useAdminPayments();
    const { signedUrl: receiptUrl } = usePaymentProofImage(paymentProof?.storage_path)


    useEffect(() => {
        const loadProof = async () => {
            if (!id) return;
            const proof = await getPaymentProof(id);
            setPaymentProof(proof);
        };
        loadProof();
    }, [id, getPaymentProof]);

    const refreshOrderData = async () => {
        const refreshedProof = await getPaymentProof(id);

        setPaymentProof(refreshedProof);

        await refetchOrder();
    };

    const handleVerify = async () => {
        if (!paymentProof) return;

        try {
            const updatedProof = await verifyPayment({
                proofId: paymentProof.id,
            });

            setPaymentProof(updatedProof);

            await refreshOrderData();
        } catch {
            // Error is exposed through paymentError
        }
    };

    const handleReject = async (reason: string) => {
        if (!paymentProof) return;

        const updatedProof = await rejectPayment({
            proofId: paymentProof.id,
            reason,
        });

        setPaymentProof(updatedProof);

        await refreshOrderData();

        setRejectModalVisible(false);
    };

    const handleFulfillmentUpdated = async (
        status: OrderStatus
    ) => {
        await refreshOrderData();

        Toast.show({
            type: 'success',
            text1: `Order moved to ${status}`,
            position: 'bottom',
        });
    };

    const handleFulfillmentError = (error: Error) => {
        Toast.show({
            type: 'error',
            text1: 'Fulfillment Failed',
            text2: error.message,
            position: 'bottom',
        });
    };

    const handleOpenMap = () => {
        // TODO: Open Google Maps / Apple Maps
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
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

    const shippingAddress = order.shipping_address;
    const paymentMethod = PAYMENT_METHODS.find((m) => m.id === order.payment_method);

    return (
        <View style={styles.container}>
            {/* Floating Back Button */}
            <View style={styles.header}>
                <Pressable style={styles.headerButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color={colors.text.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <OrderHeroCard order={order} />

                {/* Timeline */}
                <OrderTimeline
                    orderStatus={order.order_status}
                    paymentStatus={paymentProof?.status ?? PaymentProofStatus.Pending}
                    timestamps={{
                        pending: order.created_at,
                        confirmed: paymentProof?.verified_at ?? undefined,
                        processing: order.processing_at ?? undefined,
                        shipped: order.shipped_at ?? undefined,
                        delivered: order.delivered_at ?? undefined,
                    }}
                />

                {/* Items */}
                <SectionCard
                    title={
                        order.itemCount > 1
                            ? `Purchase Details (${order.itemCount} Items)`
                            : 'Purchase Details'
                    }
                    icon={<Package size={18} color={colors.gold.DEFAULT} />}
                >
                    {order.order_items?.map((item) => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                        />
                    ))}
                </SectionCard>

                {/* Shipping Address */}
                <ShippingAddressCard
                    address={shippingAddress}
                    onPressMap={handleOpenMap}
                    style={{
                        backgroundColor: ''
                    }} />

                {/* Payment Section */}
                <SectionCard
                    title="Payment"
                    icon={<CreditCard size={18} color={colors.gold.DEFAULT} />}
                >
                    {paymentProof ? (
                        <>
                            <AdminPaymentCard
                                paymentProof={paymentProof}
                                paymentMethod={paymentMethod}
                                receiptUrl={receiptUrl}
                                loading={paymentLoading}
                                onPreviewReceipt={() => setReceiptVisible(true)}
                            />
                            <PaymentVerificationActions
                                paymentStatus={paymentProof.status}
                                loading={paymentLoading}
                                onVerify={handleVerify}
                                onReject={() => setRejectModalVisible(true)}
                            />
                        </>
                    ) : (
                        <Text style={styles.text}>No payment proof uploaded.</Text>
                    )}
                    {paymentError && (
                        <Text style={styles.errorText}>{paymentError}</Text>
                    )}
                </SectionCard>

                <SectionCard
                    title="Fulfillment"
                    icon={<Package size={18} color={colors.gold.DEFAULT} />}
                >
                    <FulfillmentActions
                        orderId={order.id}
                        currentStatus={order.order_status}
                        onStatusChanged={handleFulfillmentUpdated}
                        onError={handleFulfillmentError}
                    />
                </SectionCard>

                <SectionCard
                    title="Shipping"
                    icon={<Truck size={18} color={colors.gold.DEFAULT} />}
                >
                    <ShippingInfoCard order={order} />
                </SectionCard>

                {/* Summary */}
                <SectionCard
                    title="Summary"
                    icon={<Receipt size={18} color={colors.gold.DEFAULT} />}
                >
                    <View style={styles.summaryRow}>
                        <Text style={styles.text}>Subtotal</Text>
                        <Text style={styles.text}>
                            {formatCurrency(order.subtotal_php)}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.text}>Shipping</Text>
                        <Text style={styles.text}>
                            {formatCurrency(order.shipping_fee_php)}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(order.total_amount_php)}
                        </Text>
                    </View>
                </SectionCard>
            </ScrollView>

            {/* Hidden Components */}
            <AdminReceiptViewer
                visible={receiptVisible}
                imageUrl={receiptUrl}
                onClose={() => setReceiptVisible(false)}
            />

            <RejectionReasonModal
                visible={rejectModalVisible}
                loading={paymentLoading}
                error={paymentError}
                onCancel={() => setRejectModalVisible(false)}
                onConfirm={handleReject}
            />
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    scroll: { flex: 1 },
    content: { padding: 12, paddingBottom: 24 },

    header: {
        position: 'absolute',
        top: 20,
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
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },

    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.gold.DEFAULT,
    },

    text: {
        fontSize: 14,
        color: colors.text.primary,
        marginBottom: 2
    },
    errorText: {
        fontSize: 14,
        color: colors.status.error,
        marginTop: 8,
    },
});
