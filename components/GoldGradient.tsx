import React from 'react';
import {
  StyleSheet,
  PressableProps,
  Pressable,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  View,
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
    sm: {
      minHeight: 36,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    md: {
      minHeight: 48,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },

    lg: {
      minHeight: 56,
      paddingHorizontal: 32,
      paddingVertical: 16,
    },
  };

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.buttonBase, disabled && styles.disabled, style]}
        {...props}
      >
        <GoldGradient style={[styles.gradientButton, sizeStyles[size]]}>
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
        style={[styles.buttonBase, disabled && styles.disabled, style]}
        {...props}
      >
        <View style={[styles.solidButton, sizeStyles[size]]}>
          {loading ? (
            <LoadingSpinner color={Colors.primary} />
          ) : (
            <Text style={[styles.buttonText, { color: Colors.primary }]}>
              {title}
            </Text>
          )}
        </View>
      </Pressable>
    );
  }

  // outline variant
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.buttonBase, disabled && styles.disabled, style]}
      {...props}
    >
      <View style={[styles.outlineButton, sizeStyles[size]]}>
        {loading ? (
          <LoadingSpinner color={Colors.gold.DEFAULT} />
        ) : (
          <Text style={[styles.buttonText, { color: Colors.gold.DEFAULT }]}>
            {title}
          </Text>
        )}
      </View>
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  outlineButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.gold.DEFAULT,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  solidButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 12,
  },
});
