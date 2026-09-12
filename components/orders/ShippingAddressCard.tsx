import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { SectionCard } from '@/components/orders/SectionCard';
import {
    MapPin,
    User,
    House,
    Map,
} from 'lucide-react-native';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

export interface ShippingAddressDisplay {
    full_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    province: string;
    postal_code: string;
}

interface ShippingAddressCardProps {
    address?: ShippingAddressDisplay | null;
    rightContent?: React.ReactNode;
    footer?: React.ReactNode;
    style: { backgroundColor: string; }
    onPressMap?: () => void;
}

export function ShippingAddressCard({
    address,
    rightContent,
    footer,
    onPressMap,
}: ShippingAddressCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <SectionCard
            title="Shipping Address"
            icon={<MapPin size={16} color={colors.gold.DEFAULT} />}
            rightContent={
                rightContent ??
                (onPressMap ? (
                    <TouchableOpacity
                        style={styles.mapButton}
                        activeOpacity={0.8}
                        onPress={onPressMap}
                    >
                        <Map
                            size={18}
                            color={colors.gold.DEFAULT}
                        />

                        <Text style={styles.mapButtonText}>
                            View on Map
                        </Text>
                    </TouchableOpacity>
                ) : undefined)
            }
        >
            {address ? (
                <>
                    <View style={styles.addressRow}>
                        <User
                            size={18}
                            color={colors.gold.DEFAULT}
                        />

                        <Text
                            numberOfLines={1}
                            style={styles.recipientText}
                        >
                            {address.full_name}

                            <Text style={styles.separator}>
                                {' • '}
                            </Text>

                            {address.phone_number}
                        </Text>
                    </View>

                    <View style={styles.addressRow}>
                        <House
                            size={18}
                            color={colors.gold.DEFAULT}
                        />

                        <Text
                            numberOfLines={2}
                            style={styles.addressText}
                        >
                            {address.address_line1}
                            {address.address_line2
                                ? `, ${address.address_line2}`
                                : ''}
                            {', '}
                            {address.city}, {address.province.toUpperCase()} {address.postal_code}
                        </Text>
                    </View>

                    {footer && (
                        <>
                            <View style={styles.divider} />
                            {footer}
                        </>
                    )}
                </>
            ) : (
                <Text style={styles.emptyText}>
                    No shipping address found.
                </Text>
            )}
        </SectionCard>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border.gold,
        backgroundColor: 'rgba(212,175,55,0.05)',
    },

    mapButtonText: {
        marginLeft: 5,
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: colors.gold.DEFAULT,
    },

    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    recipientText: {
        flex: 1,
        marginLeft: 10,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: colors.text.primary,
    },

    separator: {
        color: colors.text.secondary,
    },

    addressText: {
        flex: 1,
        marginLeft: 10,
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        lineHeight: 22,
        color: colors.text.secondary,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border.gold,
        opacity: 0.2,
        marginTop: 6,
        marginBottom: 12,
    },

    emptyText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: colors.text.secondary,
    },
});
