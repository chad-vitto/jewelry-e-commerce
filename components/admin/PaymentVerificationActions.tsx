import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants';
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
              <ActivityIndicator size="small" color={Colors.text.primary} />
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
              <ActivityIndicator size="small" color={Colors.text.primary} />
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

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    backgroundColor: Colors.surface,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold.light,
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
    backgroundColor: Colors.status.success,
  },
  rejectButton: {
    backgroundColor: Colors.status.error,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
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
    color: Colors.status.success,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.status.error,
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
