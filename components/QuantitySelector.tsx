import * as Haptics from 'expo-haptics';
import React from 'react';
import { Colors } from '@/constants';
import { Minus, Plus } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md',
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      triggerHaptic();
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      triggerHaptic();
      onIncrease();
    }
  };

  const buttonSize = size === 'sm' ? 28 : 36;
  const iconSize = size === 'sm' ? 16 : 18;

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize },
          quantity <= min && styles.disabledButton,
        ]}
        onPress={handleDecrease}
        disabled={quantity <= min}
        accessibilityLabel="Decrease quantity"
      >
        <Minus
          size={iconSize}
          color={quantity <= min ? Colors.text.muted : Colors.gold.DEFAULT}
        />
      </Pressable>

      <Text style={[styles.quantity, { fontSize: size === 'sm' ? 14 : 16 }]}>
        {quantity}
      </Text>

      <Pressable
        style={[
          styles.button,
          { width: buttonSize, height: buttonSize },
          quantity >= max && styles.disabledButton,
        ]}
        onPress={handleIncrease}
        disabled={quantity >= max}
        accessibilityLabel="Increase quantity"
      >
        <Plus
          size={iconSize}
          color={quantity >= max ? Colors.text.muted : Colors.gold.DEFAULT}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantity: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
});
