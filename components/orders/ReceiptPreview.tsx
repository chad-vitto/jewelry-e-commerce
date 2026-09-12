import ImageViewing from 'react-native-image-viewing';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { formatDateTime } from '@/utils/format';
import { Image } from 'expo-image';
import { useState } from 'react';

interface ReceiptPreviewProps {
  imageUrl: string | null;
  uploadedAt: string;
  onOpen?: () => void;
  loading?: boolean;
}

export function ReceiptPreview({
  imageUrl,
  uploadedAt,
  onOpen,
  loading = false,
}: ReceiptPreviewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [visible, setVisible] = useState(false);

  const handlePress = () => {
    onOpen?.();
    if (imageUrl) {
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.gold.DEFAULT} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : imageUrl ? (
        <>
          <TouchableOpacity
            style={styles.previewFrame}
            onPress={handlePress}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              contentFit="cover"
            />
          </TouchableOpacity>

          <Text style={styles.label}>Uploaded</Text>
          <Text style={styles.date}>
            {formatDateTime(uploadedAt)}
          </Text>
          <Text style={styles.hint}>Tap to preview</Text>

          <ImageViewing
            images={[{ uri: imageUrl! }]}
            imageIndex={0}
            visible={visible}
            animationType="fade"
            onRequestClose={() => setVisible(false)}
          />
        </>
      ) : (
        <Text style={styles.emptyText}>No receipt available</Text>
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text.primary,
  },
  previewFrame: {
    width: '100%',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.12)',
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: colors.border.subtle,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  date: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.text.muted,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
});
