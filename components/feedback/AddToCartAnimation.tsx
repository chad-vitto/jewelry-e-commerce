import { Colors } from '@/constants';
import { Plus, ShoppingCart } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    View,
} from 'react-native';

interface AddToCartAnimationProps {
    visible: boolean;
    onAnimationEnd?: () => void;
}

export function AddToCartAnimation({ visible, onAnimationEnd }: AddToCartAnimationProps) {
    const [translateY] = useState(() => new Animated.Value(0));
    const [translateX] = useState(() => new Animated.Value(0));
    const [opacity] = useState(() => new Animated.Value(0));
    const [scale] = useState(() => new Animated.Value(0.6));
    const [rotate] = useState(() => new Animated.Value(0));
    const [confetti, setConfetti] = useState<Animated.Value[]>([]);

    const triggerConfetti = useCallback(() => {
        const pieces = Array.from({ length: 14 }, () => new Animated.Value(0));
        setConfetti(pieces);

        pieces.forEach((value, index) => {
            Animated.sequence([
                Animated.delay(index * 18),
                Animated.timing(value, {
                    toValue: 1,
                    duration: 880,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, []);

    useEffect(() => {
        if (!visible) return;

        translateY.setValue(0);
        translateX.setValue(0);
        opacity.setValue(1);
        scale.setValue(0.3);
        rotate.setValue(0);

        Animated.sequence([
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1.35,
                    tension: 170,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -14,
                    duration: 260,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -86,
                    duration: 820,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 820,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: 0.7,
                    duration: 820,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 640,
                    delay: 160,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.05,
                    duration: 820,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            triggerConfetti();
            onAnimationEnd?.();
        });
    }, [onAnimationEnd, opacity, rotate, scale, translateX, translateY, triggerConfetti, visible]);

    if (!visible) return null;

    const rotateInterpolate = rotate.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: ['0deg', '-10deg', '-16deg'],
    });

    return (
        <View style={styles.overlay}>
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.container,
                    {
                        opacity,
                        transform: [
                            { translateY },
                            { translateX },
                            { scale },
                            { rotate: rotateInterpolate },
                        ],
                    },
                ]}
            >
                <View style={styles.iconWrapper}>
                    <View style={styles.iconGlow} />
                    <ShoppingCart size={26} color="#fff8dc" strokeWidth={2.2} />
                    <View style={styles.plusBadge}>
                        <Plus size={10} color="#4c3300" strokeWidth={3} />
                    </View>
                </View>
            </Animated.View>

            {/* Confetti burst */}
            {confetti.map((val, i) => {
                const angle = (i / confetti.length) * 2 * Math.PI;
                const dx = Math.cos(angle) * 110;
                const dy = Math.sin(angle) * 110;

                return (
                    <Animated.View
                        key={i}
                        style={[
                            styles.confetti,
                            {
                                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                                transform: [
                                    {
                                        translateX: val.interpolate({
                                            inputRange: [0, 0.2, 0.5, 1],
                                            outputRange: [0, dx * 0.18, dx * 0.7, dx],
                                        }),
                                    },
                                    {
                                        translateY: val.interpolate({
                                            inputRange: [0, 0.2, 0.5, 1],
                                            outputRange: [0, dy * 0.18, dy * 0.7, dy],
                                        }),
                                    },
                                    {
                                        scale: val.interpolate({
                                            inputRange: [0, 0.3, 0.7, 1],
                                            outputRange: [0.5, 1.3, 1.1, 0.7],
                                        }),
                                    },
                                ],
                                opacity: val.interpolate({
                                    inputRange: [0, 0.15, 0.8, 1],
                                    outputRange: [0, 1, 1, 0],
                                }),
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const CONFETTI_COLORS = [
    Colors.gold.DEFAULT,
    Colors.status.success,
    Colors.status.info,
    Colors.status.error,
    '#FF69B4', // pink
    '#00CED1', // turquoise
];

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -28,
        marginTop: -28,
        zIndex: 9999,
        elevation: 9999,
    },
    container: {
        position: 'absolute',
    },
    iconWrapper: {
        width: 62,
        height: 62,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 31,
        backgroundColor: 'rgba(212,175,55,0.22)',
        borderColor: 'rgba(255, 233, 163, 0.98)',
        borderWidth: 2,
        shadowColor: Colors.gold.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 22,
        elevation: 18,
    },
    iconGlow: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 214, 102, 0.28)',
        shadowColor: Colors.gold.DEFAULT,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 24,
    },
    plusBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7d572',
        borderWidth: 2,
        borderColor: '#fff7d1',
        shadowColor: '#f1bf2d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 10,
        elevation: 10,
    },
    confetti: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 3,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 10,
    },
});
