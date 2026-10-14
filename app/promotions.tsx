import { Check, ChevronLeft, TicketPercent } from 'lucide-react-native';
import { formatCurrency } from '@/constants';
import { GoldButton } from '@/components/GoldGradient';
import { Stack, useRouter } from 'expo-router';
import { useCart } from '@/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { FlatList, Pressable, StyleSheet, Text, View, } from 'react-native';
import type { AppColors } from '@/constants/themes';

export default function PromotionsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const {
        promotions,
        selectedPromotionId,
        setSelectedPromotionId,
        activePromotion,
        discountAmount,
    } = useCart();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to cart"
                    hitSlop={10}
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ChevronLeft size={24} color={colors.text.primary} />
                </Pressable>

                <View style={styles.headerText}>
                    <Text style={styles.title}>Discounts & Offers</Text>
                    <Text style={styles.subtitle}>
                        Choose one offer for your order.
                    </Text>
                </View>
            </View>

            <FlatList
                data={promotions}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selectedPromotionId === null }}
                        onPress={() => setSelectedPromotionId(null)}
                        style={[
                            styles.option,
                            selectedPromotionId === null && styles.optionSelected,
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <TicketPercent size={22} color={colors.gold.DEFAULT} />
                        </View>

                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>No promotion</Text>
                            <Text style={styles.optionDescription}>
                                Pay the regular order total.
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.radio,
                                selectedPromotionId === null && styles.radioSelected,
                            ]}
                        >
                            {selectedPromotionId === null && (
                                <Check size={13} color={colors.gold.DEFAULT} />
                            )}
                        </View>
                    </Pressable>
                }
                renderItem={({ item }) => {
                    const isSelected = selectedPromotionId === item.id;

                    const discountLabel =
                        item.discount_text ??
                        (item.discount_type === 'percentage'
                            ? `${item.discount_value ?? 0}% off`
                            : item.discount_type === 'fixed'
                                ? `${formatCurrency(item.discount_value ?? 0)} off`
                                : 'Special offer');

                    return (
                        <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ checked: isSelected }}
                            onPress={() => setSelectedPromotionId(item.id)}
                            style={[
                                styles.option,
                                isSelected && styles.optionSelected,
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <TicketPercent size={20} color={colors.gold.DEFAULT} />
                            </View>

                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>{item.title}</Text>

                                {!!item.message && (
                                    <Text style={styles.optionDescription}>
                                        {item.message}
                                    </Text>
                                )}

                                <Text style={styles.discountLabel}>{discountLabel}</Text>
                            </View>

                            <View
                                style={[
                                    styles.radio,
                                    isSelected && styles.radioSelected,
                                ]}
                            >
                                {isSelected && (
                                    <Check size={13} color={colors.gold.DEFAULT} />
                                )}
                            </View>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <TicketPercent
                            size={30}
                            color={colors.text.secondary}
                        />
                        <Text style={styles.emptyTitle}>
                            No promotions available
                        </Text>
                        <Text style={styles.emptyDescription}>
                            Check back later for special offers.
                        </Text>
                    </View>
                }
            />

            <View
                style={[
                    styles.footer,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                ]}
            >
                {activePromotion && discountAmount > 0 && (
                    <View style={styles.savingsRow}>
                        <Text style={styles.savingsLabel}>Your savings</Text>
                        <Text style={styles.savingsValue}>
                            {formatCurrency(discountAmount)}
                        </Text>
                    </View>
                )}

                <GoldButton
                    title="Apply Promotion"
                    onPress={() => router.back()}
                    size="lg"
                />
            </View>
        </View>
    );
}

const createStyles = (colors: AppColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 20,
            gap: 12,
        },
        backButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
        },
        headerText: {
            flex: 1,
        },
        title: {
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 25,
            color: colors.text.primary,
        },
        subtitle: {
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: colors.text.secondary,
            marginTop: 2,
        },
        listContent: {
            paddingHorizontal: 16,
            paddingBottom: 20,
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            marginBottom: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface,
        },
        optionSelected: {
            borderColor: colors.gold.DEFAULT,
            backgroundColor: colors.surface,
            borderWidth: 1.5,
        },
        iconContainer: {
            width: 42,
            height: 42,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceLight,
            marginRight: 12,
        },
        optionContent: {
            flex: 1,
            marginRight: 12,
        },
        optionTitle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            color: colors.text.primary,
        },
        optionDescription: {
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            lineHeight: 17,
            color: colors.text.secondary,
            marginTop: 4,
        },
        discountLabel: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            color: colors.gold.DEFAULT,
            marginTop: 6,
        },
        radio: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: colors.border.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
        },
        radioSelected: {
            borderColor: colors.gold.DEFAULT,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 44,
            paddingHorizontal: 24,
        },
        emptyTitle: {
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 22,
            color: colors.text.primary,
            marginTop: 14,
        },
        emptyDescription: {
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: 6,
        },
        footer: {
            paddingHorizontal: 16,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border.DEFAULT,
            backgroundColor: colors.primary,
        },
        savingsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        savingsLabel: {
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: colors.text.secondary,
        },
        savingsValue: {
            fontFamily: 'Inter_700Bold',
            fontSize: 16,
            color: colors.gold.DEFAULT,
        },
    });
