import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants';
import { Image } from 'expo-image';

interface ProductFlyToCartAnimationProps {
    visible: boolean;
    imageUri: string;

    startX: number;
    startY: number;

    endX: number;
    endY: number;

    onAnimationEnd?: () => void;
}
const THUMBNAIL_SIZE = 64;
const THUMBNAIL_RADIUS = THUMBNAIL_SIZE / 2;

const SPARKLE_COLORS = [
    Colors.gold.DEFAULT,
    Colors.gold.light,
    '#FFD700',
    '#FFFACD',
];

export const ProductFlyToCartAnimation: React.FC<ProductFlyToCartAnimationProps> = ({
    visible,
    imageUri,
    startX,
    startY,
    endX,
    endY,
    onAnimationEnd,
}) => {

    const introAnimation = useRef<Animated.CompositeAnimation | null>(null);
    const flightAnimation = useRef<Animated.CompositeAnimation | null>(null);

    const [translateX] = useState(() => new Animated.Value(0));
    const [translateY] = useState(() => new Animated.Value(0));
    const [scale] = useState(() => new Animated.Value(0.4));
    const [opacity] = useState(() => new Animated.Value(0));
    const [rotate] = useState(() => new Animated.Value(0));
    const [sparkles] = useState(() => Array.from({ length: 8 }, () => new Animated.Value(0)));
    const [arc] = useState(() => new Animated.Value(0));

    const rotateInterpolation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '25deg'],
    });

    const resetAnimation = useCallback(() => {
        translateX.setValue(0);
        translateY.setValue(0);
        arc.setValue(0);
        scale.setValue(0.2);
        opacity.setValue(1);
        rotate.setValue(0);
        sparkles.forEach(v => v.setValue(0));
    }, [translateX, translateY, arc, scale, opacity, rotate, sparkles]);

    const flightEase = useMemo(() => Easing.bezier(0.22, 1, 0.36, 1), []);

    const triggerSparkles = useCallback(() => {
        sparkles.forEach((value, index) => {
            introAnimation.current = Animated.sequence([
                Animated.delay(index * 25),
                Animated.timing(value, {
                    toValue: 1,
                    duration: 500,
                    easing: flightEase,
                    useNativeDriver: true,
                }),
            ]); introAnimation.current.start();
        });
    }, [flightEase, sparkles]);

    useEffect(() => {
        if (!visible) return;

        resetAnimation();

        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.10,
                friction: 8,
                tension: 320,
                useNativeDriver: true,
            }),

            Animated.spring(scale, {
                toValue: 0.98,
                friction: 8,
                tension: 300,
                useNativeDriver: true,
            }),

            Animated.spring(scale, {
                toValue: 1,
                friction: 8,
                tension: 280,
                useNativeDriver: true,
            }),

            Animated.timing(translateY, {
                toValue: -18,
                duration: 120,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),

            Animated.delay(30),
        ]).start(() => {
            triggerSparkles();

            flightAnimation.current = Animated.parallel([
                Animated.timing(translateX, {
                    toValue: endX - startX,
                    duration: 500,
                    easing: flightEase,
                    useNativeDriver: true,
                }),

                Animated.timing(translateY, {
                    toValue: (endY - startY) - 18,
                    duration: 650,
                    easing: flightEase,
                    useNativeDriver: true,
                }),

                Animated.sequence([
                    Animated.timing(arc, {
                        toValue: -25,
                        duration: 180,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(arc, {
                        toValue: 0,
                        duration: 470,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),

                Animated.sequence([
                    Animated.delay(420),
                    Animated.timing(scale, {
                        toValue: 0.3,
                        duration: 230,
                        easing: flightEase,
                        useNativeDriver: true,
                    }),
                ]),

                Animated.sequence([
                    Animated.delay(500),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),

                Animated.timing(rotate, {
                    toValue: 1,
                    duration: 550,
                    easing: flightEase,
                    useNativeDriver: true,
                }),
            ]); flightAnimation.current.start(() => {
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        onAnimationEnd?.();
                    });
                }, 65); // tweak between 40–70ms
            });
        });

        return () => {
            introAnimation.current?.stop();
            flightAnimation.current?.stop();

            translateX.stopAnimation();
            translateY.stopAnimation();
            scale.stopAnimation();
            opacity.stopAnimation();
            rotate.stopAnimation();
            arc.stopAnimation();

            sparkles.forEach(v => v.stopAnimation());

            resetAnimation();
        };

    }, [visible, onAnimationEnd, resetAnimation, triggerSparkles, arc,
        flightEase, endX, endY, startX, startY, translateX, translateY, scale, opacity, rotate, sparkles]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.thumbnail,
                    {
                        left: startX - THUMBNAIL_RADIUS,
                        top: startY - THUMBNAIL_RADIUS,

                        opacity,

                        transform: [
                            { translateX },
                            { translateY: Animated.add(translateY, arc) },
                            { scale },
                            { rotate: rotateInterpolation },
                        ]
                    },
                ]}
            >
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                    contentFit="cover"
                />

                {sparkles.map((value, index) => {
                    const angle = (index / sparkles.length) * 2 * Math.PI;
                    const dx = Math.cos(angle) * 54;
                    const dy = Math.sin(angle) * 54;

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.sparkle,
                                {
                                    backgroundColor:
                                        SPARKLE_COLORS[
                                        index % SPARKLE_COLORS.length
                                        ],

                                    transform: [
                                        {
                                            translateX: value.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, dx],
                                            }),
                                        },
                                        {
                                            translateY: value.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, dy],
                                            }),
                                        },
                                        {
                                            scale: value.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0.5, 1.4, 0],
                                            }),
                                        },
                                    ],

                                    opacity: value.interpolate({
                                        inputRange: [0, 0.15, 0.8, 1],
                                        outputRange: [0, 1, 1, 0],
                                    }),
                                },
                            ]}
                        />
                    );
                })}
            </Animated.View>
        </View>
    );
};



const styles = StyleSheet.create({
    thumbnail: {
        position: 'absolute',

        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,

        borderRadius: 20,

        overflow: 'hidden',

        backgroundColor: '#141414',

        borderWidth: 2,
        borderColor: Colors.gold.DEFAULT,

        shadowColor: Colors.gold.DEFAULT,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.55,
        shadowRadius: 28,

        elevation: 14,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        pointerEvents: 'none',
        zIndex: 9999,
    },
    sparkle: {
        position: 'absolute',

        left: THUMBNAIL_SIZE / 2 - 3,
        top: THUMBNAIL_SIZE / 2 - 3,

        width: 6,
        height: 6,

        borderRadius: 3,

        shadowColor: '#fff7d6',
        shadowOpacity: 0.8,
        shadowRadius: 10,

        elevation: 6,
    },
});
