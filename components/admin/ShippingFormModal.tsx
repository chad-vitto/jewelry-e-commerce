import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

interface ShippingFormModalProps {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (carrier: string, trackingNumber: string) => void;
}

export const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const canSubmit = carrier.trim().length > 0 && trackingNumber.trim().length > 0;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(carrier.trim(), trackingNumber.trim());
    setCarrier('');
    setTrackingNumber('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Ship Order</Text>

          <Text style={styles.label}>Carrier</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter carrier name"
            placeholderTextColor={colors.text.muted}
            value={carrier}
            onChangeText={setCarrier}
            editable={!loading}
          />

          <Text style={styles.label}>Tracking Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter tracking number"
            placeholderTextColor={colors.text.muted}
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            editable={!loading}
            autoCapitalize="characters"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                (!canSubmit || loading) && styles.disabled,
              ]}
              onPress={handleConfirm}
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <Text style={styles.confirmText}>Ship</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gold.light,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 6,
    padding: 10,
    color: colors.text.primary,
    backgroundColor: colors.surfaceLight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.border.subtle,
  },
  confirmButton: {
    backgroundColor: colors.status.info,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
