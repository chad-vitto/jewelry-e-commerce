import React from 'react';
import {
  StyleSheet,
  PressableProps,
  Pressable,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants';

interface GoldGradientProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  horizontal?: boolean;
}

export function GoldGradient({
  children,
  style,
  horizontal = false,
}: GoldGradientProps) {
  return (
    <LinearGradient
      colors={Colors.gold.gradient}
      start={{ x: 0, y: 0 }}
      end={horizontal ? { x: 1, y: 0 } : { x: 0, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

interface GoldButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GoldButton({
  title,
  onPress,
  variant = 'gradient',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  ...props
}: GoldButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: 0, paddingHorizontal: 1 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.buttonBase,
          sizeStyles[size],
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        <GoldGradient style={styles.gradientButton}>
          {loading ? (
            <LoadingSpinner color={Colors.primary} />
          ) : (
            <Text style={[styles.buttonText, { color: Colors.primary }]}>
              {title}
            </Text>
          )}
        </GoldGradient>
      </Pressable>
    );
  }

  if (variant === 'solid') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.buttonBase,
          sizeStyles[size],
          { backgroundColor: Colors.gold.DEFAULT },
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      >
        {loading ? (
          <LoadingSpinner color={Colors.primary} />
        ) : (
          <Text style={[styles.buttonText, { color: Colors.primary }]}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  // outline variant
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonBase,
        sizeStyles[size],
        styles.outlineButton,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <LoadingSpinner color={Colors.gold.DEFAULT} />
      ) : (
        <Text style={[styles.buttonText, { color: Colors.gold.DEFAULT }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const LoadingSpinner = ({ color }: { color: string }) => (
  <ActivityIndicator size="small" color={color} />
);

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold.DEFAULT,
  },
  disabled: {
    opacity: 0.5,
  },
});
