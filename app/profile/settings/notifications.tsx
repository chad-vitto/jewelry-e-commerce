import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { NotificationToggle } from '@/components/settings/NotificationToggle';
import { GoldButton } from '@/components';
import { ArrowLeft, Bell, Gift, Heart, Star } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const router = useRouter();
    const { user } = useAuthStore();
    const { settings, isLoading, isSaving, updateSetting, saveSettings, } = useNotifications(user?.id);

    if (isLoading || !settings) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Loading...
                </Text>
            </View>
        );
    }

    const handleSave = async () => {
        const success = await saveSettings();

        if (!success) {
            Alert.alert(
                'Error',
                'Unable to save notification preferences.',
            );
            return;
        }

        Alert.alert(
            'Success',
            'Notification preferences updated.',
        );
    };

    return (

        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}>
                    <ArrowLeft size={20} color={colors.gold.DEFAULT} />
                </Pressable>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>Stay informed about your account.</Text>
            </View>

            {/* Notification Toggles */}
            <View style={styles.card}>
                <NotificationToggle
                    icon={<Bell size={20} color={colors.gold.DEFAULT} />}
                    title="Order Updates"
                    description="Get notified about your order status"
                    value={settings.order_updates}
                    onValueChange={(value) =>
                        updateSetting('order_updates', value)
                    }
                />
                <NotificationToggle
                    icon={<Gift size={20} color={colors.gold.DEFAULT} />}
                    title="Promotions & Offers"
                    description="Receive special offers and discounts"
                    value={settings.promotions}
                    onValueChange={(value) =>
                        updateSetting('promotions', value)
                    }
                />
                <NotificationToggle
                    icon={<Heart size={20} color={colors.gold.DEFAULT} />}
                    title="Wishlist Alerts"
                    description="Be reminded when items in your wishlist change"
                    value={settings.wishlist_alerts}
                    onValueChange={(value) =>
                        updateSetting('wishlist_alerts', value)
                    }
                />
                <NotificationToggle
                    icon={<Star size={20} color={colors.gold.DEFAULT} />}
                    title="New Arrivals"
                    description="Discover the latest products as they arrive"
                    value={settings.new_arrivals}
                    onValueChange={(value) =>
                        updateSetting('new_arrivals', value)
                    }
                    showDivider={false}
                />
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
                <GoldButton
                    title={isSaving ? 'Saving...' : 'Save Changes'}
                    variant="gradient"
                    size="lg"
                    onPress={handleSave}
                    disabled={isSaving}
                />
            </View>
        </ScrollView>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    iconButton: {
        position: 'absolute',
        left: 0,
        top: 0,

        width: 42,
        height: 42,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 1,
        borderColor: colors.border.gold,
        backgroundColor: colors.surface,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
        position: 'relative',
    },
    title: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 28,
        color: colors.text.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.gold,
        overflow: 'hidden',
        marginBottom: 24,
    },
    buttonContainer: {
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },

    loadingText: {
        color: colors.text.secondary,
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
    },
});
