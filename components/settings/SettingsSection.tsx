import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export function SettingsSection({ title, children, }: SettingsSectionProps) {

    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.items}>
                {children}
            </View>
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    section: {
        marginTop: 24,
    },

    title: {
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
        color: colors.text.secondary,
        paddingHorizontal: 16,
        marginBottom: 8,
    },

    items: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border.gold,
        overflow: 'hidden',
    },
});
