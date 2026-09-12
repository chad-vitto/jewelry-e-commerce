import { ProductFlyToCartAnimation } from './ProductFlyToCartAnimation';
import { useFlyToCartStore } from '@/store';



export function ProductFlyToCartOverlay() {
    const {
        visible,
        imageUri,
        start,
        cart,
        hideAnimation,
    } = useFlyToCartStore();

    if (!visible || !imageUri) {
        return null;
    }

    return (
        <ProductFlyToCartAnimation
            visible={visible}
            imageUri={imageUri}
            startX={start.x}
            startY={start.y}
            endX={cart.x}
            endY={cart.y}
            onAnimationEnd={hideAnimation}
        />
    );
}