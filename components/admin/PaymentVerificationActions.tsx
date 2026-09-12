import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import type { PaymentProofStatus } from '@/types';

interface PaymentVerificationActionsProps {
  paymentStatus: PaymentProofStatus;
  loading?: boolean;
  onVerify: () => void;
  onReject: () => void;
}

export const PaymentVerificationActions: React.FC<PaymentVerificationActionsProps> = ({
  paymentStatus,
  loading = false,
  onVerify,
  onReject,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {paymentStatus === 'submitted' && (
        <>
          <Text style={styles.title}>Admin Actions</Text>
          <View style={styles.centerBox}>
            <Text style={styles.hint}>
              Review the payment proof.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.verifyButton, loading && styles.disabled]}
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>✓ Verify Payment</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rejectButton, loading && styles.disabled]}
            onPress={onReject}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>✕ Reject Payment</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {paymentStatus === 'verified' && (
        <View style={styles.centerBox}>
          <Text style={styles.successText}>✓ Payment Verified</Text>
          <Text style={styles.hint}>No actions available.</Text>
        </View>
      )}

      {paymentStatus === 'rejected' && (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>✕ Payment Rejected</Text>
          <Text style={styles.hint}>[ Allow Re-upload ] (optional later)</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold.light,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  verifyButton: {
    backgroundColor: colors.status.success,
  },
  rejectButton: {
    backgroundColor: colors.status.error,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.success,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.status.error,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
