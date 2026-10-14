
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import PromotionForm, { PromotionFormData, } from '@/components/admin/PromotionForm';
import { useAdminPromotions } from '@/hooks/useAdminPromotions';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { cleanupPromotionImage } from '@/utils/promotionImageStorage';

const PROMOTIONS_BUCKET = 'promotions';

export default function NewPromotionScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const { createPromotion } = useAdminPromotions();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: PromotionFormData) => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        let uploadedPath: string | null = null;
        let uploadedImageUrl: string | null = null;

        try {
            let imageUrl: string | null = null;

            // Upload the selected image before creating the promotion.
            if (formData.image_uri) {
                const uri = formData.image_uri;
                const response = await fetch(uri);

                if (!response.ok) {
                    throw new Error('Could not read the selected image.');
                }

                const imageBuffer = await response.arrayBuffer();

                const extensionMatch = uri
                    .split('?')[0]
                    .match(/\.(jpg|jpeg|png|webp|heic)$/i);

                const extension = extensionMatch?.[1]?.toLowerCase() ?? 'jpg';
                const contentType =
                    extension === 'jpg' || extension === 'jpeg'
                        ? 'image/jpeg'
                        : extension === 'png'
                            ? 'image/png'
                            : extension === 'webp'
                                ? 'image/webp'
                                : extension === 'heic'
                                    ? 'image/heic'
                                    : 'image/jpeg';

                const filePath =
                    `promotions/${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 10)}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from(PROMOTIONS_BUCKET)
                    .upload(filePath, imageBuffer, {
                        contentType,
                        upsert: false,
                    });

                if (uploadError) {
                    throw new Error(
                        `Image upload failed: ${uploadError.message}`,
                    );
                }

                uploadedPath = filePath;

                const { data } = supabase.storage
                    .from(PROMOTIONS_BUCKET)
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
                uploadedImageUrl = imageUrl;
            }

            const result = await createPromotion({
                title: formData.title,
                message: formData.message,
                discount_text: formData.discount_text || null,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value
                    ? Number(formData.discount_value)
                    : null,
                image_url: imageUrl,
                starts_at: formData.starts_at,
                ends_at: formData.ends_at,
                is_active: formData.is_active,
            });

            if (result.error) {
                // Remove the uploaded file if database creation failed.
                if (uploadedPath && uploadedImageUrl) {
                    await cleanupPromotionImage(uploadedImageUrl);
                }

                Alert.alert('Unable to Create Promotion', result.error);
                return;
            }

            Alert.alert(
                'Promotion Created',
                'The promotion has been added successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ],
            );
        } catch (error) {
            // If creation threw after upload, clean up only if no promotion references the image.
            if (uploadedPath && uploadedImageUrl) {
                await cleanupPromotionImage(uploadedImageUrl);
            }

            console.error('Failed to create promotion:', error);

            Alert.alert(
                'Unable to Create Promotion',
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.container}>
                <PromotionForm
                    title="Create Promotion"
                    onSubmit={handleSubmit}
                    onCancel={() => router.back()}
                    isLoading={isSubmitting}
                />

                {isSubmitting && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator
                            size="large"
                            color={colors.gold.DEFAULT}
                        />
                    </View>
                )}
            </View>
        </>
    );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
        },
    });
}
