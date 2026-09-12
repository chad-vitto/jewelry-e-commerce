import ImageViewing from 'react-native-image-viewing';

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
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
}
