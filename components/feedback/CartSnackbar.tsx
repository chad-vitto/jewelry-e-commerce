import { Colors, Shadows } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, } from 'react-native';
import { ChevronRight, ShoppingCart } from 'lucide-react-native';
import { Image } from 'expo-image';

interface CartSnackbarProps {
    visible: boolean;
    productName: string;
    imageUri: string;
    onDismiss: () => void;
    onViewCart: () => void;
}

const SNACKBAR_DURATION = 3000;

export function CartSnackbar({
    visible,
    productName,
    imageUri,
    onDismiss,
    onViewCart,
}: CartSnackbarProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [translateY] = useState(() => new Animated.Value(120));
    const [opacity] = useState(() => new Animated.Value(0));
    const [progress] = useState(() => new Animated.Value(1));

    const hideSnackbar = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 120,
                duration: 220,
                useNativeDriver: true,
            }),

            Animated.timing(opacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) {
                onDismiss();
            }
        });
    }, [opacity, translateY, onDismiss]);

    useEffect(() => {
        if (!visible) return;

        translateY.setValue(120);
        opacity.setValue(0);
        progress.setValue(1);

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),

            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),

            Animated.timing(progress, {
                toValue: 0,
                duration: SNACKBAR_DURATION,
                useNativeDriver: false,
            }),
        ]).start();

        const timer = setTimeout(() => {
            hideSnackbar();
        }, SNACKBAR_DURATION);

        return () => clearTimeout(timer);
    }, [
        visible,
        translateY,
        opacity,
        progress,
        hideSnackbar,
    ]);

    if (!visible) {
        return null;
    }

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.left}>
                    <View style={styles.iconContainer}>
                        <ShoppingCart
                            size={22}
                            color={colors.gold.DEFAULT}
                        />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>
                            Added to Cart
                        </Text>

                        <Text
                            numberOfLines={1}
                            style={styles.subtitle}
                        >
                            {productName}
                        </Text>
                    </View>
                </View>

                <View style={styles.thumbnailContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.thumbnail}
                        contentFit="cover"
                        transition={150}
                    />
                </View>

                <Pressable
                    style={styles.button}
                    onPress={() => {
                        hideSnackbar();
                        onViewCart();
                    }}
                >
                    <Text style={styles.buttonText}>
                        View Cart
                    </Text>

                    <ChevronRight
                        size={22}
                        color={colors.gold.DEFAULT}
                    />
                </Pressable>
            </View>

            <View style={styles.progressTrack}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width: progressWidth,
                        },
                    ]}
                />
            </View>
        </Animated.View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 95,

        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border.gold,

        backgroundColor: colors.surfaceLight,

        overflow: 'hidden',

        ...Shadows.premium,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,

        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'rgba(212,175,55,0.12)',
    },

    textContainer: {
        flex: 1,
        marginLeft: 12,
    },

    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: colors.text.primary,
    },

    subtitle: {
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: colors.text.secondary,
    },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },

    thumbnailContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'rgba(212, 175, 55, 0.08)',

        shadowColor: '#D4AF37',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,

        elevation: 8,
    },

    thumbnail: {
        width: 44,
        height: 44,
        borderRadius: 10,

        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.35)',

        backgroundColor: colors.surface,
    },

    buttonText: {
        marginRight: 2,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: colors.gold.DEFAULT,
    },

    progressTrack: {
        height: 2,
        backgroundColor: colors.border.DEFAULT,
    },

    progressFill: {
        height: '100%',
        backgroundColor: colors.gold.DEFAULT,
    },
});
