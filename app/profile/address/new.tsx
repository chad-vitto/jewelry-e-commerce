import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks';
import { useAddresses } from '@/hooks/useAddresses';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { GoldButton } from '@/components';
import { AddressForm } from '@/components/address/AddressForm';
import { ShippingAddressForm } from '@/types';
import { ArrowLeft } from 'lucide-react-native';
import { AddressLabelPicker } from '@/components/address/AddressLabelPicker';


export default function NewAddressScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user } = useAuth();

  const { address, setAddress, saveAddress } = useAddresses(user?.id);

  const [label, setLabel] = useState('Home');
  const [isDefault, setIsDefault] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddressForm, string>>>({});

  // ✅ compute validity
  const formValid = useMemo(() => {
    return (
      !!address.full_name?.trim() &&
      !!address.phone_number?.trim() &&
      !!address.address_line1?.trim() &&
      !!address.city?.trim() &&
      !!address.province?.trim() &&
      !!address.postal_code?.trim()
    );
  }, [address]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddressForm, string>> = {};
    if (!address.full_name?.trim()) newErrors.full_name = 'Full name is required';
    if (!address.phone_number?.trim()) newErrors.phone_number = 'Phone number is required';
    if (!address.address_line1?.trim()) newErrors.address_line1 = 'Address Line 1 is required';
    if (!address.city?.trim()) newErrors.city = 'City is required';
    if (!address.province?.trim()) newErrors.province = 'Province is required';
    if (!address.postal_code?.trim()) newErrors.postal_code = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      await saveAddress({
        address,
        label,
        is_default: isDefault,
      });

      Alert.alert(
        'Success',
        'Address saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );

    } catch (err) {
      console.error('Save Address Error:', err);
      Alert.alert('Error', 'Unable to save address.');

    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.gold.DEFAULT} />
        </Pressable>
        <Text style={styles.title}>New Address</Text>
        <Text style={styles.subtitle}>Where should we deliver your jewelry?</Text>
      </View>

      <AddressLabelPicker value={label} onChange={setLabel} />

      {/* Address Form */}
      <AddressForm value={address} onChange={setAddress} errors={errors} />

      {/* Default toggle */}
      <View style={styles.switchRow}>
        <Switch
          value={isDefault}
          onValueChange={setIsDefault}
          thumbColor={isDefault ? colors.gold.DEFAULT : colors.border.subtle}
        />
        <Text style={styles.switchLabel}>Make this my default address</Text>
      </View>

      {/* Save button */}
      <GoldButton
        title={isSaving ? 'Saving...' : 'Save Address'}
        variant="gradient"
        size="lg"
        onPress={handleSave}
        disabled={isSaving || !formValid}
      />
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  iconButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface
  },
  content: {
    padding: 20,
    paddingBottom: 100
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  switchLabel: { marginLeft: 8, fontSize: 14, color: colors.text.primary },
});
