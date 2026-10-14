import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';
import { useTheme } from '@/hooks/useTheme';

import PromotionForm, { PromotionFormData, } from '@/components/admin/PromotionForm';
import { cleanupPromotionImage } from '@/utils/promotionImageStorage';

export default function EditPromotionScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const { promotions, isLoading, updatePromotion, } = useAdminPromotions();

    const promotion = promotions.find((item) => item.id === id);

    if (isLoading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.container} />
            </>
        );
    }

    if (!promotion) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.container}>
                    <PromotionForm
                        title="Edit Promotion"
                        onSubmit={() => { }}
                        onCancel={() => router.back()}
                    />
                </View>
            </>
        );
    }

    const initialValues: Partial<PromotionFormData> = {
        title: promotion.title,
        message: promotion.message,
        image_uri: promotion.image_url ?? null,
        discount_text: promotion.discount_text ?? '',
        discount_type: promotion.discount_type ?? null,
        discount_value:
            promotion.discount_value != null
                ? String(promotion.discount_value)
                : '',
        starts_at: promotion.starts_at,
        ends_at: promotion.ends_at,
        is_active: promotion.is_active,
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.container}>
                <PromotionForm
                    title="Edit Promotion"
                    initialValues={initialValues}

                    onSubmit={async (formData) => {
                        const imageUri = formData.image_uri;
                        let imageUrl: string | null = null;

                        const previousImageUrl = promotion.image_url;
                        let uploadedImagePath: string | null = null;

                        try {
                            // Preserve the existing remote image URL.
                            if (imageUri?.startsWith('http://') ||
                                imageUri?.startsWith('https://')) {
                                imageUrl = imageUri;
                            } else if (imageUri) {
                                // Upload a newly selected local image.
                                const response = await fetch(imageUri);

                                if (!response.ok) {
                                    throw new Error('Could not read the selected image.');
                                }

                                const imageBuffer = await response.arrayBuffer();

                                const extension =
                                    imageUri
                                        .split('?')[0]
                                        .match(/\.(jpg|jpeg|png|webp|heic)$/i)?.[1]
                                        ?.toLowerCase() ?? 'jpg';

                                const contentType =
                                    extension === 'jpg' || extension === 'jpeg'
                                        ? 'image/jpeg'
                                        : `image/${extension}`;

                                const filePath =
                                    `promotions/${Date.now()}-${Math.random()
                                        .toString(36)
                                        .slice(2, 10)}.${extension}`;

                                const { error: uploadError } = await supabase.storage
                                    .from('promotions')
                                    .upload(filePath, imageBuffer, {
                                        contentType,
                                        upsert: false,
                                    });

                                if (uploadError) {
                                    throw new Error(
                                        `Image upload failed: ${uploadError.message}`,
                                    );
                                }
                                uploadedImagePath = filePath;

                                const { data } = supabase.storage
                                    .from('promotions')
                                    .getPublicUrl(filePath);

                                imageUrl = data.publicUrl;
                            }

                            const result = await updatePromotion(promotion.id, {
                                title: formData.title,
                                message: formData.message,
                                image_url: imageUrl,
                                discount_text: formData.discount_text || null,
                                discount_type: formData.discount_type,
                                discount_value: formData.discount_value
                                    ? Number(formData.discount_value)
                                    : null,
                                starts_at: formData.starts_at,
                                ends_at: formData.ends_at,
                                is_active: formData.is_active,
                            });

                            if (result.error) {
                                // The database still references the old image.
                                // Remove only the newly uploaded replacement.
                                if (uploadedImagePath) {
                                    await cleanupPromotionImage(imageUrl);
                                }

                                Alert.alert('Unable to Update Promotion', result.error);
                                return;
                            }

                            // The database update succeeded. Only now remove the old image,
                            // and only if the saved URL has changed.
                            if (previousImageUrl && previousImageUrl !== imageUrl) {
                                await cleanupPromotionImage(previousImageUrl);
                            }

                            Alert.alert(
                                'Promotion Updated',
                                'The promotion has been updated successfully.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.back(),
                                    },
                                ],
                            );
                        } catch (error) {
                            if (uploadedImagePath && imageUrl) {
                                await cleanupPromotionImage(imageUrl);
                            }

                            const message =
                                error instanceof Error
                                    ? error.message
                                    : 'An unexpected error occurred.';

                            Alert.alert('Unable to Update Promotion', message);
                        }
                    }}

                    onCancel={() => router.back()}
                />
            </View>
        </>
    );
}

const createStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },
    });