import { supabase } from '@/lib/supabase';

const PROMOTIONS_BUCKET = 'promotions';

export function getPromotionImagePath(
    imageUrl: string | null | undefined,
): string | null {
    if (!imageUrl) return null;

    try {
        const url = new URL(imageUrl);
        const publicPrefix = '/storage/v1/object/public/promotions/';

        if (!url.pathname.startsWith(publicPrefix)) {
            return null;
        }

        const expectedOrigin = new URL(
            supabase.storage
                .from(PROMOTIONS_BUCKET)
                .getPublicUrl('validation-placeholder').data.publicUrl,
        ).origin;

        if (url.origin !== expectedOrigin) return null;

        const encodedPath = url.pathname.slice(publicPrefix.length);
        if (!encodedPath) return null;

        const path = decodeURIComponent(encodedPath);

        if (
            path.startsWith('/') ||
            path.split('/').some(
                (segment) => !segment || segment === '.' || segment === '..',
            )
        ) {
            return null;
        }

        return path;
    } catch {
        return null;
    }
}

export async function cleanupPromotionImage(
    imageUrl: string | null | undefined,
): Promise<void> {
    const path = getPromotionImagePath(imageUrl);

    if (!path || !imageUrl) {
        console.warn(
            '[Promotion image cleanup] Skipped: URL did not match the expected Storage path.',
            imageUrl,
        );
        return;
    }

    try {
        // Never delete an image that is still referenced by a promotion.
        const { data: references, error: lookupError } = await supabase
            .from('promotions')
            .select('id')
            .eq('image_url', imageUrl)
            .limit(1);

        if (lookupError) {
            console.warn(
                'Skipped promotion image cleanup because reference check failed:',
                lookupError.message,
            );
            return;
        }

        if (references && references.length > 0) {
            console.warn(
                'Skipped promotion image cleanup because the image is still referenced.',
            );
            return;
        }

        const { error } = await supabase.storage
            .from(PROMOTIONS_BUCKET)
            .remove([path]);

        if (error) {
            console.warn('Promotion image cleanup failed:', error.message);
        }
    } catch (error) {
        console.warn('Promotion image cleanup failed:', error);
    }
}
