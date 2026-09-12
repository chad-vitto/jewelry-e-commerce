import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks';
import { useAddresses } from '@/hooks/useAddresses';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { GoldButton } from '@/components';
import { AddressForm } from '@/components/address/AddressForm';
import { AddressLabelPicker } from '@/components/address/AddressLabelPicker';
import { ShippingAddressForm } from '@/types';
import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';

export default function EditAddressScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const {
    address, setAddress, saveAddress, loadAddress, deleteAddress,
  } = useAddresses(user?.id);

  const [label, setLabel] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddressForm, string>>>({});

  // Load existing address by id
  useEffect(() => {
    if (typeof id !== 'string') return;

    const initialize = async () => {
      const data = await loadAddress(id);

      if (!data) return;

      setLabel(data.label);
      setIsDefault(data.is_default);
    };

    void initialize();
  }, [id, loadAddress]);

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

      Alert.alert('Success', 'Address updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Save Address Error:', err);
      Alert.alert('Error', 'Unable to update address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (typeof id !== 'string') {
      Alert.alert('Error', 'Invalid address.');
      return;
    }

    Alert.alert(
      'Delete Address?',
      'Are you sure you want to delete this address? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {

              const deleted = await deleteAddress(id);

              if (!deleted) {
                Alert.alert(
                  'Cannot Delete',
                  'You must keep at least one shipping address.'
                );
                return;
              }

              Alert.alert(
                'Deleted',
                'Address removed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (err) {
              console.error('Delete Address Error:', err);

              Alert.alert(
                'Error',
                'Unable to delete address.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.gold.DEFAULT} />
        </Pressable>
        <Text style={styles.title}>Edit Address</Text>
        <Text style={styles.subtitle}>Update your shipping address</Text>
      </View>

      {/* Label Picker */}
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

      {/* Action buttons */}
      <GoldButton
        title="Save Changes"
        leftIcon={<Check size={18} color={colors.primary} />}
        variant="gradient"
        size="lg"
        onPress={handleSave}
        disabled={isSaving || !formValid}
      />

      <View style={{ height: 12 }} />

      <GoldButton
        title="Delete Address"
        leftIcon={<Trash2 size={18} color={colors.gold.DEFAULT} />}
        variant="outline"
        size="lg"
        onPress={handleDelete}
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

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: colors.border.gold,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  switchRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  switchLabel: { marginLeft: 8, fontSize: 14, color: colors.text.primary },
});
