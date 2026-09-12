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

interface RejectionReasonModalProps {
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
  visible,
  loading = false,
  error = null,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [reason, setReason] = useState('');
  const maxChars = 200;

  const handleConfirm = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) return;

    try {
      await onConfirm(trimmedReason);
      setReason('');
    } catch {
      // Keep the text so the admin can correct or retry it.
      // The error is displayed below from the parent.
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Reject Payment</Text>
          <Text style={styles.subtitle}>Why are you rejecting this proof?</Text>

          <TextInput
            style={styles.textarea}
            multiline
            placeholder="Enter reason..."
            placeholderTextColor={colors.text.muted}
            value={reason}
            onChangeText={setReason}
            maxLength={maxChars}
          />

          <Text style={styles.counter}>
            {reason.length}/{maxChars}
          </Text>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.examples}>
            <Text style={styles.exampleTitle}>Examples</Text>
            <Text style={styles.example}>• Blurry receipt</Text>
            <Text style={styles.example}>• Wrong reference number</Text>
            <Text style={styles.example}>• Duplicate payment</Text>
            <Text style={styles.example}>• Invalid receipt</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
              onPress={() => { setReason(''); onCancel() }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.rejectButton,
                (loading || reason.trim().length === 0) && styles.disabled,
              ]}
              onPress={handleConfirm}
              disabled={loading || reason.trim().length === 0}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <Text style={styles.rejectText}>Reject Payment</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    padding: 10,
    color: colors.text.primary,
    backgroundColor: colors.surfaceLight,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.status.error,
    marginTop: 8,
  },
  examples: {
    marginTop: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  example: {
    fontSize: 13,
    color: colors.text.muted,
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
  rejectButton: {
    backgroundColor: colors.status.error,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
