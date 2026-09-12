import React from 'react';
import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { Home, Building2, MapPin, Star } from 'lucide-react-native';

interface AddressLabelPickerProps {
    value: string;
    onChange: (value: string) => void;
}

const LABELS = [
    { id: 'Home', icon: <Home size={16} /> },
    { id: 'Office', icon: <Building2 size={16} /> },
    { id: 'Other', icon: <MapPin size={16} /> },
    { id: 'Custom', icon: <Star size={16} /> },
];

export function AddressLabelPicker({
    value,
    onChange,
}: AddressLabelPickerProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const isCustom = value && !LABELS.some((l) => l.id === value);

    return (
        <View>
            <Text style={styles.label}>Address Label</Text>

            <View style={styles.container}>
                {LABELS.map(({ id, icon }) => {
                    const selected = value === id || (id === 'Custom' && isCustom);

                    return (
                        <Pressable
                            key={id}
                            onPress={() => onChange(id)}
                            style={[styles.chip, selected && styles.selectedChip]}
                        >
                            <View style={styles.chipContent}>
                                {React.cloneElement(icon, {
                                    color: selected ? colors.gold.DEFAULT : colors.text.secondary,
                                })}
                                <Text
                                    style={[styles.chipText, selected && styles.selectedChipText]}
                                >
                                    {id}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Custom label input */}
            {(value === 'Custom' || isCustom) && (
                <TextInput
                    style={styles.customInput}
                    value={value === 'Custom' ? '' : value}
                    onChangeText={onChange}
                    placeholder="Enter custom label"
                    placeholderTextColor={colors.text.muted}
                />
            )}
        </View>
    );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
    label: {
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
        color: colors.text.secondary,
        marginBottom: 12,
    },
    container: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    chip: {
        flex: 1,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    selectedChip: {
        backgroundColor: 'rgba(212,175,55,0.15)',
        borderColor: colors.gold.DEFAULT,
    },
    chipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chipText: {
        color: colors.text.secondary,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
    selectedChipText: {
        color: colors.gold.DEFAULT,
    },
    customInput: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: colors.text.primary,
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginBottom: 24,
    },
});
