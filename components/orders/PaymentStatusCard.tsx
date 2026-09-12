import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { formatDateTime } from '@/utils/format';
import { PaymentProofStatus } from '@/hooks/usePaymentProofs';
import { StyleSheet, Text, View } from 'react-native';
import {
  AlertCircle,
  Clock3,
  BadgeCheck,
  CircleX,
} from 'lucide-react-native';

interface PaymentStatusCardProps {
  status: PaymentProofStatus;

  paymentMethod?: string;
  referenceNumber?: string | null;

  uploadedAt?: string | null;
  verifiedAt?: string | null;

  rejectionReason?: string | null;

  onUploadPress?: () => void;
}
const STATUS_ICONS = {
  [PaymentProofStatus.Pending]: AlertCircle,
  [PaymentProofStatus.Submitted]: Clock3,
  [PaymentProofStatus.Verified]: BadgeCheck,
  [PaymentProofStatus.Rejected]: CircleX,
};

const STATUS_CONFIG = {
  [PaymentProofStatus.Pending]: {
    title: 'Awaiting Payment',
    message: 'Please upload your payment receipt.',
    subMessage: 'Your order will be reviewed after submission.',
  },

  [PaymentProofStatus.Submitted]: {
    title: 'Verification in Progress',
    message: 'Your payment proof has been received.',
    subMessage: 'Estimated review within 24 hours.',
  },

  [PaymentProofStatus.Verified]: {
    title: 'Payment Verified',
    message: 'Your payment has been verified.',
    subMessage: 'Your order is now being prepared.',
  },

  [PaymentProofStatus.Rejected]: {
    title: 'Payment Rejected',
    message: 'Please upload a new payment receipt.',
    subMessage: '',
  },
} as const;

export function PaymentStatusCard({
  status,
  paymentMethod,
  referenceNumber,
  uploadedAt,
  verifiedAt,
  rejectionReason,
}: PaymentStatusCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const statusColors = {
    [PaymentProofStatus.Pending]: colors.status.warning,
    [PaymentProofStatus.Submitted]: colors.status.info,
    [PaymentProofStatus.Verified]: colors.status.success,
    [PaymentProofStatus.Rejected]: colors.status.error,
  };

  const config = STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];
  const iconColor = statusColors[status]

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Payment Status</Text>

      <View style={styles.statusHeader}>
        <Icon
          size={20}
          color={iconColor}
        />
        <Text style={styles.statusTitle}>
          {config.title}
        </Text>
      </View>

      <Text style={styles.message}>{config.message}</Text>
      <Text style={styles.subMessage}>{config.subMessage}</Text>

      <View style={styles.details}>
        {paymentMethod && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>
        )}

        {referenceNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.referenceValue}>{referenceNumber}</Text>
          </View>
        )}

        {uploadedAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Uploaded</Text>
            <Text style={styles.detailValue}>{formatDateTime(uploadedAt)}</Text>
          </View>
        )}

        {status === PaymentProofStatus.Verified && verifiedAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verified</Text>
            <Text style={styles.detailValue}>{formatDateTime(verifiedAt)}</Text>
          </View>
        )}

        {/* Rejected */}
        {status === PaymentProofStatus.Rejected && rejectionReason && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reason</Text>
            <Text style={styles.rejectionReason}>{rejectionReason}</Text>
          </View>
        )}
      </View>
    </View>


  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    backgroundColor: colors.surfaceLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.primary,
    marginTop: 10,
  },
  subMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.gold.DEFAULT,
    marginTop: 4,
  },
  rejectionReason: {
    fontSize: 13,
    color: colors.status.error,
    marginTop: 8,
    fontStyle: 'italic',
  },
  details: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(212,175,55,0.20)',
    gap: 14,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  referenceValue: {
  fontSize: 15,
  fontWeight: '700',
  color: colors.gold.DEFAULT,
}
});
