import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

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

  const skeletonWidth = typeof width === 'string' ? width : width;

  return (
    <View
      style={[
        {
          width: skeletonWidth,
          height,
          borderRadius,
          backgroundColor: Colors.surfaceLight,
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
          colors={['transparent', Colors.gold.DEFAULT + '20', 'transparent']}
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

  return (
    <View style={[styles.productCard, { width: cardWidth }]}>
      <Skeleton width="100%" height={cardWidth} borderRadius={16} />
      <View style={styles.productContent}>
        <Skeleton width="80%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
        <Skeleton width={40} height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={20} borderRadius={4} />
      </View>
    </View>
  );
}

// Carousel of Skeletons
export function ProductCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.carousel}>
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function SectionSkeleton() {
  return (
    <View style={styles.section}>
      <Skeleton width={150} height={24} borderRadius={4} style={{ marginLeft: 16, marginBottom: 16 }} />
      <ProductCarouselSkeleton />
    </View>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    ...Shadows.premium
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
