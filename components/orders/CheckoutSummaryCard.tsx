import * as Clipboard from 'expo-clipboard';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Copy, CreditCard, Package } from 'lucide-react-native';

import { formatCurrency } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

interface CheckoutSummaryCardProps {
    orderNumber: string;
    total: number;
    paymentMethod: string;
    itemCount: number;
}

export function CheckoutSummaryCard({
    orderNumber,
    total,
    paymentMethod,
    itemCount,
}: CheckoutSummaryCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const handleCopy = async () => {
        await Clipboard.setStringAsync(orderNumber);

        Alert.alert(
            'Copied!',
            `Order number #${orderNumber} copied to clipboard.`,
        );
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>
                ORDER SUMMARY
            </Text>

            {/* Order Number */}
            <View style={styles.orderRow}>
                <Text style={styles.orderNumber}>
                    #{orderNumber}
                </Text>

                <Pressable
                    style={styles.copyButton}
                    onPress={handleCopy}
                >
                    <Copy
                        size={14}
                        color={colors.gold.DEFAULT}
                    />

                    <Text style={styles.copyText}>
                        Copy
                    </Text>
                </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Total */}
            <Text style={styles.label}>
                Total Amount
            </Text>

            <Text style={styles.total}>
                {formatCurrency(total)}
            </Text>

            <View style={styles.infoSection}>

                <View style={styles.infoRow}>
                    <CreditCard
                        size={15}
                        color={colors.gold.DEFAULT}
                    />

                    <Text style={styles.infoLabel}>
                        Payment
                    </Text>

                    <Text style={styles.infoValue}>
                        {paymentMethod}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Package
                        size={15}
                        color={colors.gold.DEFAULT}
                    />

                    <Text style={styles.infoLabel}>
                        Items
                    </Text>

                    <Text style={styles.infoValue}>
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                    </Text>
                </View>

            </View>

            <View style={styles.successDivider} />

            <View style={styles.successRow}>
                <CheckCircle2
                    size={16}
                    color="#59C36A"
                />

                <Text style={styles.successText}>
                    Order Successfully Created
                </Text>
            </View>
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 18,
        padding: 18,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border.gold,
    },

    title: {
        fontSize: 11,
        letterSpacing: 1.5,
        fontWeight: '700',
        color: colors.gold.DEFAULT,
        textAlign: 'center',
        marginBottom: 14,
    },

    orderRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    orderNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text.primary,
        marginRight: 10,
    },

    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        backgroundColor: 'rgba(212,175,55,0.08)',
    },

    copyText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: colors.gold.DEFAULT,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.gold,
        opacity: 0.25,
        marginBottom: 16,
    },

    label: {
        fontSize: 13,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    total: {
        marginTop: 4,
        marginBottom: 18,
        fontSize: 34,
        fontWeight: '700',
        color: colors.gold.DEFAULT,
        textAlign: 'center',
    },

    infoSection: {
        gap: 12,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoLabel: {
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
        color: colors.text.secondary,
    },

    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },

    successDivider: {
        height: 1,
        backgroundColor: colors.border.gold,
        opacity: 0.2,
        marginVertical: 16,
    },

    successRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    successText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#59C36A',
    },
});
