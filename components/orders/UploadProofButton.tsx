import { Colors } from '@/constants';
import { ImagePlus } from 'lucide-react-native';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface UploadProofButtonProps {
  onUploadPress: () => void;   // triggers gallery/camera picker
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function UploadProofButton({
  onUploadPress,
  label = 'Upload Receipt',
  loading = false,
  disabled = false,
}: UploadProofButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.card, (disabled || loading) && styles.buttonDisabled]}
      onPress={onUploadPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <ActivityIndicator
            size="large"
            color={Colors.gold.DEFAULT}
          />

          <Text style={styles.hint}>
            Uploading...
          </Text>
        </>
      ) : (
        <>
          <ImagePlus
            size={32}
            color={Colors.gold.DEFAULT}
          />
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.subtitle}>Supports PNG, JPG & HEIC</Text>
          <Text style={styles.hint}>Tap to browse</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginVertical: 12,
    backgroundColor: Colors.surface,

    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 4,
  },
});
