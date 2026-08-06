import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Colors } from '@/constants';
import { Copy } from 'lucide-react-native';
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
                Order Number
            </Text>

            <View style={styles.row}>
                <Text style={styles.orderId}>
                    #{order.shortId}
                </Text>

                <TouchableOpacity
                    onPress={handleCopy}
                    style={styles.copyButton}
                >
                    <Copy
                        size={15}
                        color={Colors.text.secondary}
                    />

                    <Text style={styles.copyText}>
                        Copy
                    </Text>
                </TouchableOpacity>
            </View>


            <OrderStatusBadge status={badgeStatus} />


            <View style={styles.divider} />


            <Text style={styles.date}>
                Placed {order.formattedDate}
            </Text>


            <Text style={styles.total}>
                {order.formattedTotal}
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: 20,
        padding: 20,
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
        fontSize: 13,
        color: Colors.text.secondary,
        marginBottom: 6,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    orderId: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: Colors.text.primary,
        marginRight: 10,
    },

    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.border.DEFAULT,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    copyText: {
        marginLeft: 4,
        fontSize: 13,
        color: Colors.text.secondary,
        fontFamily: 'Inter_500Medium',
    },

    divider: {
        width: '100%',
        height: 1,
        backgroundColor: Colors.border.DEFAULT,
        marginVertical: 14,
    },

    date: {
        fontSize: 13,
        color: Colors.text.secondary,
    },

    total: {
        marginTop: 6,
        fontFamily: 'Inter_700Bold',
        fontSize: 20,
        color: Colors.text.primary,
    },
});