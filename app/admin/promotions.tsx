import { GoldButton } from '@/components';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';
import { router, Stack, useFocusEffect } from 'expo-router';
import { ChevronLeft, Edit2, Tag, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Switch, Text, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminPromotionsScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const { promotions, isLoading, error, fetchPromotions, toggleActive, deletePromotion, } = useAdminPromotions();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [busyPromotionId, setBusyPromotionId] = useState<string | null>(null);
    const [optimisticActive, setOptimisticActive] = useState<Record<string, boolean>>({});
    const [promotionNow, setPromotionNow] = useState<number | null>(null);

    const sortedPromotions = useMemo(() => {
        if (promotionNow === null) {
            return promotions;
        }

        const now = promotionNow;

        const getPriority = (promotion: (typeof promotions)[number]) => {
            const startsAt = new Date(promotion.starts_at).getTime();
            const endsAt = new Date(promotion.ends_at).getTime();

            if (endsAt <= now) return 3; // Expired
            if (!promotion.is_active) return 1; // Inactive
            if (startsAt > now) return 2; // Scheduled

            return 0; // Active
        };

        return [...promotions].sort(
            (a, b) => getPriority(a) - getPriority(b),
        );
    }, [promotions, promotionNow]);

    const expiringPromotionIds = useRef(new Set<string>());
    const toggleActiveRef = useRef(toggleActive);



    useEffect(() => {
        toggleActiveRef.current = toggleActive;
    }, [toggleActive]);

    useEffect(() => {
        setPromotionNow(Date.now());
    }, [promotions]);

    useEffect(() => {
        const expirePromotions = async () => {
            const now = Date.now();

            promotions.forEach((promotion) => {
                if (
                    !promotion.is_active ||
                    new Date(promotion.ends_at).getTime() > now
                ) {
                    expiringPromotionIds.current.delete(promotion.id);
                }
            });

            const expiredPromotionIds = promotions
                .filter(
                    (promotion) =>
                        promotion.is_active &&
                        new Date(promotion.ends_at).getTime() <= now &&
                        !expiringPromotionIds.current.has(promotion.id),
                )
                .map((promotion) => promotion.id);

            if (expiredPromotionIds.length === 0) {
                setPromotionNow(now);
                return;
            }

            await Promise.all(
                expiredPromotionIds.map(async (id) => {
                    expiringPromotionIds.current.add(id);
                    setOptimisticActive((current) => ({
                        ...current,
                        [id]: false,
                    }));

                    const result = await toggleActiveRef.current(id, false);

                    if (result.error) {
                        expiringPromotionIds.current.delete(id);
                        setOptimisticActive((current) => {
                            const next = { ...current };
                            delete next[id];
                            return next;
                        });
                    }
                }),
            );

            setPromotionNow(now);
        };

        let isActive = true;
        let expirationTimer: ReturnType<typeof setTimeout> | undefined;

        const scheduleNextTransition = () => {
            if (!isActive) return;

            const schedulingNow = Date.now();
            const nextTransition = promotions
                .filter((promotion) => promotion.is_active)
                .flatMap((promotion) => [
                    new Date(promotion.starts_at).getTime(),
                    new Date(promotion.ends_at).getTime(),
                ])
                .filter((timestamp) => Number.isFinite(timestamp) && timestamp > schedulingNow)
                .reduce((earliest, timestamp) => Math.min(earliest, timestamp), Infinity);

            if (!Number.isFinite(nextTransition)) return;

            expirationTimer = setTimeout(async () => {
                await expirePromotions();
                scheduleNextTransition();
            }, Math.max(0, nextTransition - schedulingNow + 50));
        };

        void expirePromotions();
        scheduleNextTransition();

        return () => {
            isActive = false;
            if (expirationTimer) clearTimeout(expirationTimer);
        };
    }, [promotions]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);

        try {
            await fetchPromotions();
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchPromotions]);

    useFocusEffect(
        useCallback(() => {
            fetchPromotions();
        }, [fetchPromotions]),
    );

    const handleToggle = useCallback(
        async (id: string, value: boolean) => {
            const promotion = promotions.find((item) => item.id === id);

            if (!promotion) {
                return;
            }

            const isExpired = new Date(promotion.ends_at).getTime() <= Date.now();

            if (isExpired && value) {
                Alert.alert(
                    'Promotion expired',
                    'An expired promotion cannot be activated.',
                );
                return;
            }

            const previousValue = promotion.is_active;

            // Update the UI immediately.
            setOptimisticActive((current) => ({
                ...current,
                [id]: value,
            }));

            setBusyPromotionId(id);

            try {
                const result = await toggleActive(id, value);

                if (result.error) {
                    setOptimisticActive((current) => ({
                        ...current,
                        [id]: previousValue,
                    }));

                    Alert.alert(
                        'Unable to update promotion',
                        result.error,
                    );
                } else {
                    setOptimisticActive((current) => {
                        const next = { ...current };
                        delete next[id];
                        return next;
                    });
                }
            } finally {
                setBusyPromotionId(null);
            }
        },
        [promotions, toggleActive],
    );

    const handleDelete = useCallback(
        (id: string, title: string) => {
            Alert.alert(
                'Delete Promotion',
                `Are you sure you want to delete "${title}"? This action cannot be undone.`,
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            setBusyPromotionId(id);

                            try {
                                const result = await deletePromotion(id);

                                if (result.error) {
                                    Alert.alert('Unable to delete promotion', result.error);
                                }
                            } finally {
                                setBusyPromotionId(null);
                            }
                        },
                    },
                ],
            );
        },
        [deletePromotion],
    );

    const renderPromotion = useCallback(({ item }: { item: PromotionCardProps['promotion'] }) => {
        if (promotionNow === null) {
            return null;
        }

        return (
            <PromotionCard
                promotion={item}
                promotionNow={promotionNow}
                isBusy={busyPromotionId === item.id}
                colors={colors}
                optimisticActive={optimisticActive[item.id]}
                onToggle={handleToggle}
                onDelete={handleDelete}
            />
        );
    }, [busyPromotionId, colors, handleDelete, handleToggle, optimisticActive, promotionNow]);

    if (isLoading && promotions.length === 0) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
                <Text style={styles.stateTitle}>Loading promotions</Text>
                <Text style={styles.stateMessage}>
                    Preparing your promotion library…
                </Text>
            </View>
        );
    }

    if (error && promotions.length === 0) {
        return (
            <View style={styles.centerState}>
                <View style={styles.stateIcon}>
                    <Text style={styles.stateIconText}>!</Text>
                </View>

                <Text style={styles.stateTitle}>Something went wrong</Text>
                <Text style={styles.stateMessage}>{error}</Text>

                <GoldButton
                    title="Try Again"
                    variant="gradient"
                    size="lg"
                    onPress={fetchPromotions}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={colors.text.primary} />
                </Pressable>
                <View style={styles.headerTitle}>
                    <Tag size={28} color={colors.gold.DEFAULT} />
                    <Text style={styles.title}>Promotions</Text>
                </View>
                <View style={{ width: 40 }} />
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{promotions.length}</Text>
                </View>
            </View>

            <FlatList
                data={sortedPromotions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    promotions.length === 0 && styles.emptyListContent,
                    { paddingBottom: insets.bottom + 112 },
                ]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.gold.DEFAULT}
                    />
                }


                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Text style={styles.emptyIconText}>%</Text>
                        </View>

                        <Text style={styles.emptyTitle}>No promotions yet</Text>
                        <Text style={styles.emptyMessage}>
                            Your promotion library is empty. Create your first offer to get
                            started.
                        </Text>

                    </View>
                }

                renderItem={renderPromotion}
            />

            <View
                style={[
                    styles.createButtonContainer,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                ]}
            >
                <GoldButton
                    title="Create Promotion"
                    variant="gradient"
                    size="lg"
                    onPress={() => router.push('/admin/promotions/new')}
                />
            </View>
        </View>
    );
}

type PromotionCardProps = {
    promotion: {
        id: string;
        title: string;
        message: string;
        discount_text: string | null;
        starts_at: string;
        ends_at: string;
        is_active: boolean;
    };
    promotionNow: number;
    isBusy: boolean;
    colors: AppColors;
    optimisticActive: boolean | undefined;
    onToggle: (id: string, value: boolean) => void;
    onDelete: (id: string, title: string) => void;
};

const PromotionCard = memo(function PromotionCard({
    promotion,
    promotionNow,
    isBusy,
    colors,
    optimisticActive,
    onToggle,
    onDelete,
}: PromotionCardProps) {
    const styles = createStyles(colors);
    const startsAt = new Date(promotion.starts_at).getTime();
    const endsAt = new Date(promotion.ends_at).getTime();

    const isScheduled = startsAt > promotionNow;
    const isExpired = endsAt <= promotionNow;

    const statusLabel = isExpired
        ? 'Expired'
        : promotion.is_active
            ? isScheduled
                ? 'Scheduled'
                : 'Active'
            : 'Inactive';

    const statusTone = isExpired
        ? 'error'
        : promotion.is_active
            ? isScheduled
                ? 'info'
                : 'success'
            : 'neutral';

    return (
        <View style={styles.card}>
            <View style={styles.cardTopRow}>
                <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {promotion.title}
                    </Text>

                    {promotion.discount_text ? (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>
                                {promotion.discount_text}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <StatusBadge label={statusLabel} tone={statusTone} colors={colors} />
            </View>

            <Text style={styles.cardMessage} numberOfLines={3}>
                {promotion.message}
            </Text>

            <View style={styles.datePanel}>
                <DateRow
                    label="Starts"
                    value={formatDate(promotion.starts_at)}
                    colors={colors}
                />
                <View style={styles.dateDivider} />
                <DateRow
                    label="Ends"
                    value={formatDate(promotion.ends_at)}
                    colors={colors}
                />
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.activationRow}>
                    <View>
                        <Text style={styles.activationTitle}>Promotion status</Text>
                        <Text style={styles.activationSubtitle}>
                            {isExpired
                                ? 'This offer has expired.'
                                : promotion.is_active
                                    ? 'Customers can receive this offer.'
                                    : 'This offer is currently hidden.'}
                        </Text>
                    </View>

                    <Switch
                        value={optimisticActive ?? promotion.is_active}
                        onValueChange={(value) => onToggle(promotion.id, value)}
                        disabled={isBusy || isExpired}
                        trackColor={{
                            false: colors.border.subtle,
                            true: colors.gold.muted,
                        }}
                        thumbColor={
                            (optimisticActive ?? promotion.is_active)
                                ? colors.gold.DEFAULT
                                : colors.text.secondary
                        }
                        ios_backgroundColor={colors.border.subtle}
                    />
                </View>

                <View style={styles.actionRow}>
                    <Pressable
                        style={styles.iconActionButton}
                        onPress={() => router.push(`/admin/promotions/edit/${promotion.id}`)}
                        disabled={isBusy}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${promotion.title}`}
                        hitSlop={8}
                    >
                        <Edit2 size={18} color={colors.gold.DEFAULT} strokeWidth={1.8} />
                    </Pressable>

                    <Pressable
                        style={styles.iconActionButton}
                        onPress={() => onDelete(promotion.id, promotion.title)}
                        disabled={isBusy}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${promotion.title}`}
                        hitSlop={8}
                    >
                        <Trash2 size={18} color={colors.status.error} strokeWidth={1.8} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

function DateRow({
    label,
    value,
    colors,
}: {
    label: string;
    value: string;
    colors: AppColors;
}) {
    const styles = createDateRowStyles(colors);

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} numberOfLines={2}>
                {value}
            </Text>
        </View>
    );
}

const createDateRowStyles = (colors: AppColors) =>
    StyleSheet.create({
        label: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: colors.text.muted,
            marginBottom: 4,
        },
        value: {
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            color: colors.text.primary,
        },
    });

function StatusBadge({
    label,
    tone,
    colors,
}: {
    label: string;
    tone: 'success' | 'info' | 'error' | 'neutral';
    colors: AppColors;
}) {
    const styles = createStatusStyles(colors);
    const toneStyles = {
        success: {
            background: styles.success,
            dot: styles.successDot,
            text: styles.successText,
        },
        info: {
            background: styles.info,
            dot: styles.infoDot,
            text: styles.infoText,
        },
        error: {
            background: styles.error,
            dot: styles.errorDot,
            text: styles.errorText,
        },
        neutral: {
            background: styles.neutral,
            dot: styles.neutralDot,
            text: styles.neutralText,
        },
    }[tone];

    return (
        <View
            style={[
                styles.badge,
                toneStyles.background,
            ]}
        >
            <View
                style={[
                    styles.dot,
                    toneStyles.dot,
                ]}
            />
            <Text
                style={[
                    styles.text,
                    toneStyles.text,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const createStatusStyles = (colors: AppColors) =>
    StyleSheet.create({
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        success: {
            backgroundColor: `${colors.status.success}20`,
        },
        neutral: {
            backgroundColor: colors.surface,
        },
        info: {
            backgroundColor: `${colors.status.info}20`,
        },
        error: {
            backgroundColor: `${colors.status.error}20`,
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            marginRight: 6,
        },
        successDot: {
            backgroundColor: colors.status.success,
        },
        infoDot: {
            backgroundColor: colors.status.info,
        },
        errorDot: {
            backgroundColor: colors.status.error,
        },
        neutralDot: {
            backgroundColor: colors.text.secondary,
        },
        mutedDot: {
            backgroundColor: colors.text.muted,
        },
        text: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 11,
        },
        successText: {
            color: colors.status.success,
        },
        infoText: {
            color: colors.status.info,
        },
        errorText: {
            color: colors.status.error,
        },
        neutralText: {
            color: colors.text.secondary,
        },
    });

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    createButtonContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 0,
        paddingTop: 12,
        backgroundColor: colors.surface,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 24,
        color: colors.text.primary,
    },
    headerCopy: {
        flex: 1,
        paddingRight: 16,
    },
    eyebrow: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        letterSpacing: 1.6,
        color: colors.gold.DEFAULT,
        marginBottom: 4,
    },
    heading: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 32,
        lineHeight: 38,
        color: colors.text.primary,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 19,
        color: colors.text.secondary,
        marginTop: 4,
    },
    countBadge: {
        minWidth: 36,
        height: 36,
        paddingHorizontal: 10,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    countText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: colors.text.primary,
    },
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: 16,
        marginBottom: 14,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitleWrap: {
        flex: 1,
        paddingRight: 12,
    },
    cardTitle: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 21,
        lineHeight: 25,
        color: colors.text.primary,
    },
    discountBadge: {
        alignSelf: 'flex-start',
        marginTop: 7,
        borderRadius: 999,
        backgroundColor: colors.gold.DEFAULT,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },

    discountText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: colors.surface,
        letterSpacing: 0.3,
    },
    cardMessage: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 19,
        color: colors.text.secondary,
        marginBottom: 14,
    },
    datePanel: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: colors.surface,
        padding: 12,
        marginBottom: 14,
    },
    dateDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: colors.border.subtle,
        marginHorizontal: 12,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
        paddingTop: 14,
    },
    activationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    activationTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: colors.text.primary,
    },
    activationSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: colors.text.secondary,
        marginTop: 3,
        maxWidth: 230,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    iconActionButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.subtle,
        backgroundColor: colors.surface,
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        padding: 28,
    },
    stateIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gold.muted,
        marginBottom: 14,
    },
    stateIconText: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 25,
        color: colors.gold.DEFAULT,
    },
    stateTitle: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 23,
        color: colors.text.primary,
        textAlign: 'center',
    },
    stateMessage: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 19,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 20,
        maxWidth: 320,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gold.muted,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        marginBottom: 16,
    },
    emptyIconText: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 34,
        color: colors.gold.DEFAULT,
    },
    emptyTitle: {
        fontFamily: 'CormorantGaramond_700Bold',
        fontSize: 25,
        color: colors.text.primary,
        textAlign: 'center',
    },
    emptyMessage: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 20,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: 7,
        marginBottom: 22,
        maxWidth: 330,
    },
});