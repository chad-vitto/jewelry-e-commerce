import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { PaymentMethod, PaymentProof, PaymentProofStatus } from '@/types';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

interface AdminPaymentCardProps {
  paymentProof: PaymentProof;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string | null; // signed URL from parent
  loading?: boolean;
  onPreviewReceipt: () => void;
}

export function AdminPaymentCard({
  paymentProof,
  paymentMethod,
  receiptUrl,
  loading = false,
  onPreviewReceipt,
}: AdminPaymentCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  const statusText = (() => {
    switch (paymentProof.status) {
      case PaymentProofStatus.Pending:
        return '🟡 Awaiting Payment';

      case PaymentProofStatus.Submitted:
        return '🟡 Verification in Progress';

      case PaymentProofStatus.Verified:
        return '🟢 Verified';

      case PaymentProofStatus.Rejected:
        return '🔴 Rejected';

      default:
        return 'Unknown';
    }
  })();

  const statusColor = (() => {
    switch (paymentProof.status) {
      case PaymentProofStatus.Verified:
        return colors.status.success;

      case PaymentProofStatus.Rejected:
        return colors.status.error;

      case PaymentProofStatus.Pending:
      case PaymentProofStatus.Submitted:
      default:
        return colors.status.warning;
    }
  })();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>💳 Payment</Text>
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.label}>Payment Method</Text>
        <Text style={styles.value}>
          {paymentMethod?.name ?? '—'}
        </Text>
      </View>

      {/* Reference Number */}
      <View style={styles.section}>
        <Text style={styles.label}>Reference Number</Text>
        <Text style={styles.value}>
          {paymentProof.reference_number ?? '—'}
        </Text>
      </View>

      {/* Uploaded */}
      <View style={styles.section}>
        <Text style={styles.label}>Uploaded</Text>
        <Text style={styles.value}>
          {paymentProof.uploaded_at
            ? new Date(paymentProof.uploaded_at).toLocaleString()
            : '—'}
        </Text>
      </View>

      {/* Verified */}
      <View style={styles.section}>
        <Text style={styles.label}>Verified</Text>
        <Text style={styles.value}>
          {paymentProof.verified_at
            ? new Date(paymentProof.verified_at).toLocaleString()
            : '—'}
        </Text>
      </View>

      {/* Rejection Reason */}
      {paymentProof.status === PaymentProofStatus.Rejected &&
        paymentProof.rejection_reason && (
          <View style={styles.section}>
            <Text style={styles.label}>Rejection Reason</Text>
            <Text style={[styles.value, styles.rejection]}>
              {paymentProof.rejection_reason}
            </Text>
          </View>
        )}

      {/* Receipt */}
      <View style={styles.section}>
        <Text style={styles.label}>Receipt</Text>

        <View style={styles.receiptBox}>
          {receiptUrl ? (
            <Image
              source={{ uri: receiptUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.receiptFile}>
              No receipt uploaded
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.previewButton,
              !receiptUrl && { opacity: 0.5 },
            ]}
            disabled={!receiptUrl}
            onPress={onPreviewReceipt}
          >
            <Text style={styles.previewButtonText}>
              Preview Receipt
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gold.DEFAULT,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  value: {
    fontSize: 14,
    color: colors.text.primary,
  },
  rejection: {
    color: colors.status.error,
  },
  receiptBox: {
    borderWidth: 1,
    borderColor: colors.border.gold,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  receiptFile: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 8,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  previewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.gold.DEFAULT,
    borderRadius: 4,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gold.light,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.text.muted,
  },
});
