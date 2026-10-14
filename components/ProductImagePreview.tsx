
import ImageViewing from 'react-native-image-viewing';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ImageViewerCloseHeader } from '@/components/orders/ImageViewerCloseHeader';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ProductImagePreviewProps {
    images: string[];
    imageIndex: number;
    visible: boolean;
    onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('screen').height;


interface ProductImageHeaderProps {
    activeIndex: number;
    imageCount: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

function ProductImageHeader({
    activeIndex,
    imageCount,
    onClose,
    onPrevious,
    onNext,
}: ProductImageHeaderProps) {
    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.closeHeader} pointerEvents="box-none">
                <ImageViewerCloseHeader onClose={onClose} />
            </View>

            <View style={styles.controls} pointerEvents="box-none">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Previous product image"
                    disabled={activeIndex === 0}
                    onPress={onPrevious}
                    style={[
                        styles.arrowButton,
                        activeIndex === 0 && styles.disabledButton,
                    ]}
                >
                    <ChevronLeft size={26} color="#FFFFFF" />
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next product image"
                    disabled={activeIndex === imageCount - 1}
                    onPress={onNext}
                    style={[
                        styles.arrowButton,
                        activeIndex === imageCount - 1 && styles.disabledButton,
                    ]}
                >
                    <ChevronRight size={26} color="#FFFFFF" />
                </Pressable>
            </View>
        </View>
    );
}


export default function ProductImagePreview({
    images,
    imageIndex,
    visible,
    onClose,
}: ProductImagePreviewProps) {
    const viewerImages = images.map((uri) => ({ uri }));
    const navigateToImage = useRef<((index: number) => void) | null>(null);
    const [activeIndex, setActiveIndex] = useState(imageIndex);

    const latestRef = useRef({
        onClose,
        imageCount: images.length,
        navigate: navigateToImage,
    });

    useEffect(() => {
        latestRef.current = {
            onClose,
            imageCount: images.length,
            navigate: navigateToImage,
        };
    }, [onClose, images.length]);

    const StableHeader = useMemo(
        () =>
        (function StableHeader(
            {
                imageIndex: currentIndex,
            }: {
                imageIndex: number;
            }
        ) {
            return (
                <ProductImageHeader
                    activeIndex={currentIndex}
                    imageCount={latestRef.current.imageCount}
                    onClose={latestRef.current.onClose}
                    onPrevious={() => {
                        latestRef.current.navigate.current?.(
                            Math.max(0, currentIndex - 1)
                        );
                    }}
                    onNext={() => {
                        latestRef.current.navigate.current?.(
                            Math.min(
                                latestRef.current.imageCount - 1,
                                currentIndex + 1
                            )
                        );
                    }}
                />
            );
        }),
        []
    );


    const goToPrevious = () => {
        const nextIndex = Math.max(0, activeIndex - 1);
        navigateToImage.current?.(nextIndex);
    };

    const goToNext = () => {
        const nextIndex = Math.min(images.length - 1, activeIndex + 1);
        navigateToImage.current?.(nextIndex);
    };

    useEffect(() => {
        if (visible) {
            setActiveIndex(imageIndex);
        }
    }, [visible, imageIndex]);

    return (
        <ImageViewing
            images={viewerImages}
            imageIndex={imageIndex}
            onImageIndexChange={setActiveIndex}
            onNavigate={(navigate) => {
                navigateToImage.current = navigate;
            }}
            visible={visible}
            animationType="fade"
            backgroundColor="#000000"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
            HeaderComponent={StableHeader}
        />
    );
}


const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        zIndex: 20,
    },

    closeHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },

    controls: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: [{ translateY: -22 }],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    arrowButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(20, 20, 20, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.3,
    },
});
