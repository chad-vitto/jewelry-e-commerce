import { AdminPaymentCard } from '@/components/admin/AdminPaymentCard';
import { AdminReceiptViewer } from '@/components/admin/AdminReceiptViewer';
import { Colors, formatCurrency, PAYMENT_METHODS } from '@/constants';
import { OrderHeroCard } from '@/components/orders/OrderHeroCard';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { PaymentVerificationActions } from '@/components/admin/PaymentVerificationActions';
import { RejectionReasonModal } from '@/components/admin/RejectionReasonModal';
import { SectionCard } from '@/components/orders/SectionCard';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrder } from '@/hooks/useOrders';
import { usePaymentProofImage } from '@/hooks/usePaymentProofImage';
import {
    ArrowLeft,
    CreditCard,
    MapPin,
    Package,
    Receipt,
} from 'lucide-react-native';
import {
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
    View,
    ActivityIndicator,
} from 'react-native';
import { PaymentProofStatus, type PaymentProof } from '@/types';

export default function AdminOrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { order, isLoading, error, refetch: refetchOrder } = useOrder(id);

    const {
        getPaymentProof,
        verifyPayment,
        rejectPayment,
        loading: paymentLoading,
        error: paymentError,
    } = useAdminPayments();

    const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);
    const [receiptVisible, setReceiptVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const { signedUrl: receiptUrl } = usePaymentProofImage(paymentProof?.storage_path)


    useEffect(() => {
        const loadProof = async () => {
            if (!id) return;
            const proof = await getPaymentProof(id);
            setPaymentProof(proof);
        };
        loadProof();
    }, [id, getPaymentProof]);

    const refreshOrderDetail = async () => {
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
            await refreshOrderDetail();
        } catch {
            // useAdminPayments exposes the user-facing error through paymentError.
        }
    };

    const handleReject = async (reason: string) => {
        if (!paymentProof) return;

        const updatedProof = await rejectPayment({
            proofId: paymentProof.id,
            reason,
        });

        setPaymentProof(updatedProof);
        await refreshOrderDetail();
        setRejectModalVisible(false);
    };


    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
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
                    <ArrowLeft size={24} color={Colors.text.primary} />
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
                />

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

                {/* Payment Section */}
                <SectionCard
                    title="Payment"
                    icon={<CreditCard size={18} color={Colors.gold.DEFAULT} />}
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

                {/* Summary */}
                <SectionCard
                    title="Summary"
                    icon={<Receipt size={18} color={Colors.gold.DEFAULT} />}
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface },
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
        color: Colors.text.primary,
    },

    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.gold.DEFAULT,
    },

    text: {
        fontSize: 14,
        color: Colors.text.primary,
        marginBottom: 2
    },
    errorText: {
        fontSize: 14,
        color: Colors.status.error,
        marginTop: 8,
    },
});
