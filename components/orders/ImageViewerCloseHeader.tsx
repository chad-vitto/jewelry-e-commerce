import { X } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ImageViewerCloseHeaderProps {
  onClose: () => void;
}

export function ImageViewerCloseHeader({ onClose }: ImageViewerCloseHeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close image preview"
        hitSlop={16}
        onPress={onClose}
        style={styles.closeButton}
      >
        <X size={22} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    marginTop: 8,
    marginRight: 8,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000077',
  },
});