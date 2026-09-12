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
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

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
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={colors.gold.gradient}
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
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function GoldButton({
  title,
  onPress,
  variant = 'gradient',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  leftIcon,
  rightIcon,
  ...props
}: GoldButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

  const renderContent = (textColor: string) => {
    if (loading) {
      return <LoadingSpinner color={textColor} />;
    }

    return (
      <View style={styles.content}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        <Text
          style={[
            styles.buttonText,
            { color: textColor },
          ]}
        >
          {title}
        </Text>

        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
    );
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
          {renderContent(colors.primary)}
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
          {renderContent(colors.primary)}
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
        {renderContent(colors.gold.DEFAULT)}
      </View>
    </Pressable>
  );
}

const LoadingSpinner = ({ color }: { color: string }) => (
  <ActivityIndicator size="small" color={color} />
);

const createStyles = (colors: AppColors) => StyleSheet.create({
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
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
    borderColor: colors.gold.DEFAULT,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  solidButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 12,
  },
});
