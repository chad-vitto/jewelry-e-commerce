import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShippingAddress } from '@/types';
import { Colors, Shadows } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { User, Phone, MapPin, Crown, Home, Building2, Star } from 'lucide-react-native';

interface AddressCardProps {
    address: ShippingAddress;
    onPress?: () => void;
}

export const AddressCard = ({ address, onPress, }: AddressCardProps) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const renderLabelIcon = () => {
        switch (address.label?.toLowerCase()) {
            case 'home':
                return <Home size={22} color={colors.gold.DEFAULT} style={styles.icon} />;
            case 'office':
                return <Building2 size={22} color={colors.gold.DEFAULT} style={styles.icon} />;
            case 'other':
                return <MapPin size={22} color={colors.gold.DEFAULT} style={styles.icon} />;
            default:
                // Custom label
                return <Star size={22} color={colors.gold.DEFAULT} style={styles.icon} />;
        }
    };

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed,]}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    {renderLabelIcon()}
                    <Text style={styles.label}>{address.label}</Text>
                </View>

                {address.is_default && (
                    <View style={styles.defaultBadge}>
                        <Crown size={14} color={colors.text.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            {/* Name */}
            <View style={styles.row}>
                <User size={18} color={colors.gold.DEFAULT} style={styles.icon} />
                <Text style={styles.name}>{address.full_name}</Text>
            </View>

            {/* Phone */}
            <View style={styles.row}>
                <Phone size={18} color={colors.gold.DEFAULT} style={styles.icon} />
                <Text style={styles.phone}>{address.phone_number}</Text>
            </View>

            <View style={styles.divider} />

            {/* Address */}
            <View style={styles.row}>
                <MapPin size={18} color={colors.gold.DEFAULT} style={styles.icon} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.line}>{address.address_line1}</Text>
                    {address.address_line2 ? (
                        <Text style={styles.line}>{address.address_line2}</Text>
                    ) : null}
                    <Text style={styles.line}>
                        {address.city}, {address.province} {address.postal_code}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: colors.border.gold,
        marginBottom: 14,
        ...Shadows.md,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    label: {
        fontSize: 16,
        fontFamily: 'CormorantGaramond_700Bold',
        color: colors.gold.DEFAULT,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingHorizontal: 10,
        paddingVertical: 5,

        borderRadius: 999,

        backgroundColor: 'rgba(212,175,55,.10)',

        borderWidth: 1,
        borderColor: 'rgba(212,175,55,.25)',
    },
    defaultText: {
        color: colors.gold.DEFAULT,
        fontFamily: 'Inter_600SemiBold',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: colors.text.primary,
    },
    phone: {
        fontSize: 18,
        fontFamily: 'Inter_500Medium',
        color: colors.text.secondary,
    },
    line: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'Inter_400Regular',
        color: colors.text.secondary,
    },
});
