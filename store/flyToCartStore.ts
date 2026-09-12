import { create } from 'zustand';

export interface FlyPoint {
    x: number;
    y: number;
}

interface FlyToCartState {
    visible: boolean;
    imageUri: string | null;
    start: FlyPoint;
    cart: FlyPoint;

    onComplete?: () => void;
    showAnimation: (
        imageUri: string,
        start: FlyPoint,
        onComplete?: () => void
    ) => void;

    hideAnimation: () => void;
    setCartPosition: (position: FlyPoint) => void;
}

export const useFlyToCartStore = create<FlyToCartState>((set) => ({
    visible: false,
    imageUri: null,
    onComplete: undefined,
    start: { x: 0, y: 0, },
    cart: { x: 0, y: 0, },

    showAnimation: (imageUri, start, onComplete) => {
        set({
            visible: true,
            imageUri,
            start,
            onComplete,
        });
    },

    hideAnimation: () => {
        let callback: (() => void) | undefined;

        set((state) => {
            callback = state.onComplete;

            return state;
        });

        callback?.();

        set({
            visible: false,
            imageUri: null,
            onComplete: undefined,
        });
    },

    setCartPosition: (position) =>
        set({
            cart: position,
        }),
}));