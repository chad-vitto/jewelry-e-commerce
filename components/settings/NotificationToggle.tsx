import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export interface NotificationToggleProps {
    icon: React.ReactNode;
    title: string;
    description: string;

    value: boolean;
    onValueChange: (value: boolean) => void;

    disabled?: boolean;
    showDivider?: boolean;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
    icon,
    title,
    description,
    value,
    onValueChange,
    disabled = false,
    showDivider = true
}) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    return (
        <>
            <View style={[styles.container, disabled && styles.disabled]}>
                <View style={styles.left}>
                    <View style={styles.icon}>{icon}</View>
                    <View style={styles.texts}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.description}>{description}</Text>
                    </View>
                </View>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    disabled={disabled}
                    accessibilityRole="switch"
                    thumbColor={value ? colors.gold.DEFAULT : colors.border.subtle}
                    trackColor={{ true: colors.border.gold, false: colors.border.subtle }}
                />
            </View>
            {showDivider && <View style={styles.divider} />}
        </>
    );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        justifyContent: 'space-between',
    },
    disabled: {
        opacity: 0.5,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    icon: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontFamily: 'Inter_600SemiBold',
        color: colors.text.primary,
    },
    description: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: colors.text.secondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginLeft: 68,
        backgroundColor: colors.border.gold,
        opacity: 0.35,
    },
});
