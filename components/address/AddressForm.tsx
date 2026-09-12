import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ShippingAddressForm } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

interface AddressFormProps {
  value: ShippingAddressForm;
  onChange: (value: ShippingAddressForm) => void;
  errors?: Partial<Record<keyof ShippingAddressForm, string>>; // ✅ new prop
}

export function AddressForm({
  value,
  onChange,
  errors = {},
}: AddressFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={value.full_name}
          onChangeText={(text) => onChange({ ...value, full_name: text })}
          placeholder="Enter your full name"
          placeholderTextColor={colors.text.muted}
        />
        {errors.full_name && <Text style={styles.error}>{errors.full_name}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={value.phone_number}
          onChangeText={(text) => onChange({ ...value, phone_number: text })}
          placeholder="09XX XXX XXXX"
          placeholderTextColor={colors.text.muted}
          keyboardType="phone-pad"
        />
        {errors.phone_number && <Text style={styles.error}>{errors.phone_number}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput
          style={styles.input}
          value={value.address_line1}
          onChangeText={(text) => onChange({ ...value, address_line1: text })}
          placeholder="Street address"
          placeholderTextColor={colors.text.muted}
        />
        {errors.address_line1 && <Text style={styles.error}>{errors.address_line1}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Address Line 2</Text>
        <TextInput
          style={styles.input}
          value={value.address_line2 || ''}
          onChangeText={(text) => onChange({ ...value, address_line2: text })}
          placeholder="Apartment, unit, etc. (optional)"
          placeholderTextColor={colors.text.muted}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={value.city}
            onChangeText={(text) => onChange({ ...value, city: text })}
            placeholder="City"
            placeholderTextColor={colors.text.muted}
          />
          {errors.city && <Text style={styles.error}>{errors.city}</Text>}
        </View>
        <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
          <Text style={styles.label}>Province *</Text>
          <TextInput
            style={styles.input}
            value={value.province}
            onChangeText={(text) => onChange({ ...value, province: text })}
            placeholder="Province"
            placeholderTextColor={colors.text.muted}
          />
          {errors.province && <Text style={styles.error}>{errors.province}</Text>}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Postal Code *</Text>
        <TextInput
          style={styles.input}
          value={value.postal_code}
          onChangeText={(text) => onChange({ ...value, postal_code: text })}
          placeholder="1234"
          placeholderTextColor={colors.text.muted}
          keyboardType="numeric"
        />
        {errors.postal_code && <Text style={styles.error}>{errors.postal_code}</Text>}
      </View>
    </>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  formGroup: { marginBottom: 14 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text.primary,
  },
  error: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
