import React, { useState } from 'react';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { TextInput, View, Text, StyleSheet, StyleProp, ViewStyle, TextInputProps } from 'react-native';

export interface GoldInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;

    placeholder?: string;
    error?: string;

    secureTextEntry?: boolean;
    keyboardType?: TextInputProps['keyboardType'];
    autoCapitalize?: TextInputProps['autoCapitalize'];
    textContentType?: TextInputProps['textContentType'];
    returnKeyType?: TextInputProps['returnKeyType'];
    autoCorrect?: boolean;
    autoComplete?: TextInputProps['autoComplete'];

    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;

    editable?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function GoldInput({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    leftIcon,
    rightIcon,
    editable = true,
    style,
    textContentType,
    returnKeyType,
    autoCorrect,
    autoComplete,
}: GoldInputProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
    const [focused, setFocused] = useState(false);

    const borderColor = (() => {
        if (!editable) return colors.border.DEFAULT;
        if (error) return colors.status.error;
        if (focused) return colors.gold.DEFAULT;
        return colors.border.subtle;
    })();

    return (
        <View style={[styles.container, style, !editable && styles.disabled]}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, { borderColor }]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.muted}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    textContentType={textContentType}
                    returnKeyType={returnKeyType}
                    autoCorrect={autoCorrect}
                    autoComplete={autoComplete}
                    selectionColor={colors.gold.DEFAULT}
                    editable={editable}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 14,
        minHeight: 56,
    },
    input: {
        flex: 1,
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: colors.text.primary,
    },
    leftIcon: {
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightIcon: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    error: {
        fontSize: 12,
        color: colors.status.error,
        marginTop: 4,
    },
    disabled: {
        opacity: 0.6,
    },
});
