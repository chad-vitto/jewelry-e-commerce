import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { Copy, CalendarDays, Wallet, } from 'lucide-react-native';
import { CustomerOrderCard } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';

interface OrderHeroCardProps {
    order: CustomerOrderCard;
}

export function OrderHeroCard({ order }: OrderHeroCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const handleCopy = async () => {
        await Clipboard.setStringAsync(order.shortId);

        Alert.alert(
            'Copied!',
            `Order number #${order.shortId} copied to clipboard.`
        );
    };

    const badgeStatus =
        order.order_status as React.ComponentProps<typeof OrderStatusBadge>['status'];

    return (
        <View style={styles.card}>

            <Text style={styles.label}>
                ORDER NUMBER
            </Text>

            <View style={styles.orderRow}>
                <Text style={styles.orderId}>
                    #{order.shortId}
                </Text>

                <TouchableOpacity
                    onPress={handleCopy}
                    style={styles.copyButton}
                    activeOpacity={0.8}
                >
                    <Copy
                        size={14}
                        color={colors.gold.DEFAULT}
                    />

                    <Text style={styles.copyText}>
                        Copy
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.badgeContainer}>
                <OrderStatusBadge status={badgeStatus} />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>

                <View style={styles.infoColumn}>

                    <View style={styles.infoHeader}>
                        <CalendarDays
                            size={14}
                            color={colors.gold.DEFAULT}
                        />

                        <Text style={styles.infoLabel}>
                            Placed On
                        </Text>
                    </View>

                    <Text style={styles.dateValue}>
                        {order.formattedDate}
                    </Text>

                </View>

                <View style={styles.verticalDivider} />

                <View style={styles.infoColumn}>

                    <View style={styles.infoHeader}>
                        <Wallet
                            size={14}
                            color={colors.gold.DEFAULT}
                        />

                        <Text style={styles.infoLabel}>
                            Total Amount
                        </Text>
                    </View>

                    <Text style={styles.amountValue}>
                        {order.formattedTotal}
                    </Text>

                </View>

            </View>

        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 3,
    },

    label: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color: colors.gold.DEFAULT,
        marginBottom: 2,
    },

    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },

    orderId: {
        fontFamily: 'Inter_700Bold',
        fontSize: 28,
        color: colors.text.primary,
        marginRight: 10,
    },

    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 8,
        paddingVertical: 4,

        borderRadius: 14,

        backgroundColor: 'rgba(212,175,55,0.08)',
    },

    copyText: {
        marginLeft: 4,
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: colors.gold.DEFAULT,
    },

    badgeContainer: {
        marginBottom: 6,
    },

    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.border.gold,
        opacity: 0.2,
        marginVertical: 8,
        marginTop: 4,
        marginBottom: 10,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        width: '100%',
    },

    infoColumn: {
        flex: 1,
        alignItems: 'center',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },

    verticalDivider: {
        width: 1,
        backgroundColor: colors.border.gold,
        opacity: 0.2,
        marginHorizontal: 16,
    },

    infoLabel: {
        marginLeft: 5,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: colors.gold.DEFAULT,
    },

    dateValue: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: colors.text.primary,
        textAlign: 'center',
    },

    amountValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 21,
        color: colors.text.primary,
        marginTop: -1,
    },
});
