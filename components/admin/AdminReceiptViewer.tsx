import ImageViewing from 'react-native-image-viewing';
import { ImageViewerCloseHeader } from '@/components/orders/ImageViewerCloseHeader';

interface AdminReceiptViewerProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function AdminReceiptViewer({
  visible,
  imageUrl,
  onClose,
}: AdminReceiptViewerProps) {
  if (!imageUrl) return null;

  return (
    <ImageViewing
      images={[{ uri: imageUrl }]}
      imageIndex={0}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      HeaderComponent={() => <ImageViewerCloseHeader onClose={onClose} />}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
}
