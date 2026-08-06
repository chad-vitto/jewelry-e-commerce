import { Colors } from '@/constants';
import { PaymentProof, PaymentProofStatus } from '@/types';
import { ReceiptPreview } from './ReceiptPreview';
import { usePaymentProofImage } from '@/hooks/usePaymentProofImage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface PaymentProofCardProps {
  paymentProof: PaymentProof | null;
  loading?: boolean;
  onReplace: () => void;
}
const BUTTON_LABELS = {
  [PaymentProofStatus.Pending]: 'Replace Receipt',
  [PaymentProofStatus.Submitted]: 'Replace Receipt',
  [PaymentProofStatus.Rejected]: 'Upload Corrected Receipt',
  [PaymentProofStatus.Verified]: 'View Receipt',
};

export function PaymentProofCard({
  paymentProof,
  loading = false,
  onReplace,
}: PaymentProofCardProps) {
  const { signedUrl } = usePaymentProofImage(paymentProof?.storage_path);

  if (!paymentProof) {
    return null;
  }

  const replaceButtonLabel = BUTTON_LABELS[paymentProof.status];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Payment Proof</Text>

      {loading && (
        <ActivityIndicator
          size="small"
          color={Colors.gold.DEFAULT}
          style={{ marginVertical: 8 }}
        />
      )}

      <View style={styles.section}>
        {signedUrl && (
          <ReceiptPreview
            imageUrl={signedUrl}
            loading={loading}
            uploadedAt={paymentProof.uploaded_at}
          />
        )}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.referenceValue}>
              {paymentProof.reference_number ?? '—'}
            </Text>
          </View>

          {paymentProof.status === PaymentProofStatus.Rejected && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rejection Reason</Text>
              <Text style={styles.rejectionReason}>
                {paymentProof.rejection_reason ?? 'No reason provided'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={onReplace}>
          <Text style={styles.buttonText}>{replaceButtonLabel}</Text>
        </TouchableOpacity>

        {paymentProof.status === PaymentProofStatus.Pending && (
          <Text style={styles.text}>Awaiting verification…</Text>
        )}

        {paymentProof.status === PaymentProofStatus.Verified && (
          <Text style={styles.text}>Payment verified ✅</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    backgroundColor: Colors.surfaceLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.text.primary,
  },
  section: {
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
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
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  referenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gold.DEFAULT,
  },
  rejectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.status.error,
    marginTop: 8,
  },
  rejectionReason: {
    fontSize: 13,
    color: Colors.status.error,
    marginTop: 8,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 22,
    backgroundColor: Colors.gold.DEFAULT,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.surface,
    fontWeight: '600',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.border.subtle,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});
