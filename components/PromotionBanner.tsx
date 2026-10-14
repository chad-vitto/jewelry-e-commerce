import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Tag } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle, } from 'react-native';
import type { Promotion } from '@/hooks/usePromotions';
import type { AppColors } from '@/constants/themes';

interface PromotionBannerProps {
    promotion: Promotion;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export default function PromotionBanner({
    promotion,
    style,
    onPress,
}: PromotionBannerProps) {
    const { colors } = useTheme();
    const hasImage = Boolean(promotion.image_url);
    const styles = createStyles(colors, hasImage);

    return (
        <Pressable
            style={[styles.container, style]}
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? 'button' : undefined}
        >
            <LinearGradient
                colors={[
                    colors.surface,
                    colors.primary,
                    colors.surface,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Decorative gold glow */}
                <View style={styles.glow} />

                {hasImage && (
                    <Image
                        source={{ uri: promotion.image_url! }}
                        style={styles.image}
                        contentFit="cover"
                        transition={250}
                    />
                )}

                <View style={styles.content}>
                    {/* Eyebrow */}
                    <View style={styles.eyebrowRow}>
                        <View style={styles.iconContainer}>
                            <Tag
                                size={13}
                                color={colors.gold.DEFAULT}
                                strokeWidth={1.8}
                            />
                        </View>

                        <Text style={styles.eyebrow}>
                            SPECIAL OFFER
                        </Text>
                    </View>

                    {/* Main offer */}
                    {promotion.discount_text && (
                        <Text
                            style={styles.discountText}
                            numberOfLines={1}
                        >
                            {promotion.discount_text}
                        </Text>
                    )}

                    {/* Offer title */}
                    <Text
                        style={styles.title}
                        numberOfLines={2}
                    >
                        {promotion.title}
                    </Text>

                    {/* Supporting message */}
                    <View style={styles.messageRow}>
                        <Text
                            style={styles.message}
                            numberOfLines={2}
                        >
                            {promotion.message}
                        </Text>

                        {onPress && (
                            <View style={styles.cta}>
                                <Text style={styles.ctaText}>
                                    Claim Offer
                                </Text>

                                <ArrowRight
                                    size={15}
                                    color={colors.primary}
                                    strokeWidth={2.2}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Gold accent line */}
                <View style={styles.accentLine} />
            </LinearGradient>
        </Pressable>
    );
}

const createStyles = (colors: AppColors, hasImage: boolean) =>
    StyleSheet.create({
        container: {
            marginVertical: 6,
            borderRadius: 22,
            overflow: 'hidden',

            shadowColor: colors.gold.DEFAULT,
            shadowOffset: {
                width: 0,
                height: 7,
            },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 5,
        },
        card: {
            minHeight: 158,
            borderWidth: 1,
            borderColor: colors.gold.muted,
            borderRadius: 22,
            overflow: 'hidden',
            position: 'relative',
        },
        glow: {
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: 90,
            top: -90,
            right: -50,
            backgroundColor: colors.gold.DEFAULT,
            opacity: 0.08,
        },
        image: {
            position: 'absolute',
            right: 0,
            top: 0,
            width: '42%',
            height: '100%',
            opacity: 0.9,
        },
        content: {
            paddingHorizontal: 18,
            paddingVertical: 15,
            paddingRight: hasImage ? '30%' : 18,
            zIndex: 2,
        },
        eyebrowRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 7,
        },
        iconContainer: {
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 7,
            backgroundColor: colors.gold.muted,
            borderWidth: 1,
            borderColor: colors.gold.DEFAULT,
        },
        eyebrow: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 9,
            letterSpacing: 1.5,
            color: colors.gold.DEFAULT,
        },
        discountText: {
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 34,
            lineHeight: 36,
            color: colors.text.primary,
            letterSpacing: 0.5,
            marginBottom: 1,
        },
        title: {
            fontFamily: 'Inter_700Bold',
            fontSize: 11,
            lineHeight: 15,
            letterSpacing: 1.2,
            color: colors.text.primary,
            marginBottom: 5,
        },
        messageRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
        },
        message: {
            flex: 1,
            flexShrink: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            lineHeight: 16,
            color: colors.text.secondary,
        },
        cta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.gold.DEFAULT,
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 999,
            marginBottom: 1,
        },

        ctaText: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 9,
            color: colors.primary,
        },
        accentLine: {
            position: 'absolute',
            left: 20,
            bottom: 0,
            width: 54,
            height: 2,
            backgroundColor: colors.gold.DEFAULT,
        },
    });