import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks';
import { useAddresses } from '@/hooks/useAddresses';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { AddressCard } from '@/components/address/AddressCard';
import { ArrowLeft, Plus, Lock, Sparkles } from 'lucide-react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { GoldButton } from '@/components';

export default function AddressesScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const { user } = useAuth();
    const router = useRouter();

    const { addresses, loadAddresses, isLoading } = useAddresses(user?.id);

    useFocusEffect(
        useCallback(() => {
            void loadAddresses();
        }, [loadAddresses])
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.iconButton} onPress={() => router.back()}>
                    <ArrowLeft size={20} color={colors.gold.DEFAULT} />
                </Pressable>

                <View style={styles.headerContent}>
                    <Text style={styles.title}>Addresses</Text>
                    <Text style={styles.subtitle}>Manage your shipping addresses</Text>
                </View>

                <Pressable style={styles.iconButton} onPress={() => router.push('/profile/address/new')}>
                    <Plus size={20} color={colors.gold.DEFAULT} />
                </Pressable>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Lock size={18} color={colors.gold.DEFAULT} style={{ marginRight: 8 }} />
                    <Text style={styles.infoText}>
                        Your default address will be used for a faster checkout experience.
                    </Text>
                    <Sparkles size={18} color={colors.gold.DEFAULT} style={{ marginLeft: 8 }} />
                </View>
            </View>

            {/* Address List */}
            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) =>
                    <AddressCard
                        address={item}
                        onPress={() =>
                            router.push(`/profile/address/${item.id}`)
                        }
                    />}
                ListEmptyComponent={
                    isLoading
                        ? null
                        : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyTitle}>No saved addresses</Text>
                                <Text style={styles.emptySubtitle}>
                                    Add your first shipping address to speed up checkout.
                                </Text>
                            </View>
                        )
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={loadAddresses}
            />

            {/* Loading Overlay */}
            {isLoading && addresses.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            )}
            <View style={styles.footer}>
                <GoldButton
                    title="Add New Address"
                    variant="gradient"
                    size="lg"
                    leftIcon={
                        <View style={styles.plusCircle}>
                            <Plus size={16} color={colors.gold.DEFAULT} />
                        </View>
                    }
                    onPress={() => router.push('/profile/address/new')}
                />
            </View>

        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 16,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.gold.DEFAULT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 30,
        color: colors.text.primary,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.border.gold,
        borderRadius: 12,
        marginHorizontal: 20,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: colors.text.secondary,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.surfaceLight + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: colors.text.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    plusCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,

        backgroundColor: colors.surface, // or colors.surface

        justifyContent: 'center',
        alignItems: 'center',

        marginRight: 4,
    },
});
