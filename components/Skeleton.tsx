import { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadows } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const [animatedValue] = useState(
    () => new Animated.Value(0)
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceLight,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            'transparent',
            colors.gold.DEFAULT + '20',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  const cardWidth = (SCREEN_WIDTH - 48) / 2;
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.productCard,
        {
          width: cardWidth,
        },
      ]}
    >
      <Skeleton
        width="100%"
        height={cardWidth}
        borderRadius={16}
      />

      <View style={styles.productContent}>
        <Skeleton
          width="80%"
          height={16}
          borderRadius={4}
          style={{ marginBottom: 4 }}
        />

        <Skeleton
          width={40}
          height={12}
          borderRadius={4}
          style={{ marginBottom: 6 }}
        />

        <Skeleton
          width="50%"
          height={20}
          borderRadius={4}
        />
      </View>
    </View>
  );
}

// Carousel Skeleton
export function ProductCarouselSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.carousel}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function SectionSkeleton() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.section}>
      <Skeleton
        width={150}
        height={24}
        borderRadius={4}
        style={{
          marginLeft: 16,
          marginBottom: 16,
        }}
      />

      <ProductCarouselSkeleton />
    </View>
  );
}

export function ProductGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  productCard: {
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',

    backgroundColor: colors.surface,

    ...Shadows.premium,
  },

  productContent: {
    padding: 12,
  },

  carousel: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },

  section: {
    marginBottom: 24,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
});
