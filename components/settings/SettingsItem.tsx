import React from 'react';
import { View, Text, Pressable, StyleSheet, } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export interface SettingsItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    disabled?: boolean;
    showDivider?: boolean;
    showChevron?: boolean;
}

export function SettingsItem({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    disabled = false,
    showDivider = true,
    showChevron = true,
}: SettingsItemProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <>
            <Pressable
                onPress={onPress}
                disabled={disabled}
                style={({ pressed }) => [
                    styles.container,
                    pressed && !disabled && styles.pressed,
                    disabled && styles.disabled,
                ]}
            >
                <View style={styles.content}>
                    {/* Left side */}
                    <View style={styles.left}>
                        <View style={styles.icon}>{icon}</View>

                        <View style={styles.texts}>
                            <Text style={styles.title}>{title}</Text>

                            {subtitle ? (
                                <Text style={styles.subtitle}>
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    {/* Right side */}
                    <View style={styles.right}>
                        {rightElement ? (
                            rightElement
                        ) : showChevron ? (
                            <ChevronRight
                                size={18}
                                color={colors.text.muted}
                            />
                        ) : null}
                    </View>
                </View>
            </Pressable>
            {showDivider && (
                <View style={styles.divider} />
            )}
        </>
    );
}

const createStyles = (colors: AppColors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 64,
            paddingVertical: 14,
            paddingHorizontal: 20,
            backgroundColor: colors.surface,
        },
        content: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        pressed: {
            backgroundColor: colors.surfaceLight,
        },
        disabled: {
            opacity: 0.5,
        },
        left: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        icon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },
        texts: {
            flex: 1,
            justifyContent: 'center',
        },
        title: {
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold',
            color: colors.text.primary,
        },
        subtitle: {
            fontSize: 13,
            fontFamily: 'Inter_400Regular',
            color: colors.text.secondary,
            marginTop: 2,
        },
        right: {
            width: 24,
            alignItems: 'flex-end',
            justifyContent: 'center',
            marginLeft: 16,
        },
        divider: {
            height: 1,
            marginLeft: 70,
            marginRight: 20,
            backgroundColor: colors.border.gold,
            opacity: 0.35,
        },
    });
