import { ChevronLeft, ImagePlus, RefreshCw, X } from 'lucide-react-native';
import { GoldButton, GoldInput } from '@/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';
import { View, Text, TextInput, StyleSheet, Switch, Pressable, Alert, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerChangeEvent, } from '@react-native-community/datetimepicker';

export interface PromotionFormData {
    title: string;
    message: string;
    image_uri: string | null;
    discount_text: string;
    discount_type: 'percentage' | 'fixed' | null;
    discount_value: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
}

interface PromotionFormProps {
    title?: string;
    initialValues?: Partial<PromotionFormData>;
    onSubmit: (formData: PromotionFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function PromotionForm({
    title = 'Create Promotion',
    initialValues,
    onSubmit,
    onCancel,
    isLoading = false,
}: PromotionFormProps) {
    const { colors } = useAppTheme();
    const styles = createStyles(colors);

    const [formData, setFormData] = useState<PromotionFormData>({
        title: initialValues?.title ?? '',
        message: initialValues?.message ?? '',
        image_uri: initialValues?.image_uri ?? null,
        discount_text: initialValues?.discount_text ?? '',
        discount_type: initialValues?.discount_type ?? null,
        discount_value:
            initialValues?.discount_value != null
                ? String(initialValues.discount_value)
                : '',
        starts_at: initialValues?.starts_at ?? '',
        ends_at: initialValues?.ends_at ?? '',
        is_active: initialValues?.is_active ?? false,
    });

    const [pickerField, setPickerField] = useState<
        'starts_at' | 'ends_at' | null
    >(null);

    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const [pickerDate, setPickerDate] = useState(new Date());
    const [imageUri, setImageUri] = useState<string | null>(
        initialValues?.image_uri ?? null
    );


    useEffect(() => {
        if (!initialValues) return;

        setFormData({
            title: initialValues.title ?? '',
            message: initialValues.message ?? '',
            image_uri: initialValues.image_uri ?? null,
            discount_text: initialValues.discount_text ?? '',
            discount_type: initialValues.discount_type ?? null,
            discount_value:
                initialValues.discount_value != null
                    ? String(initialValues.discount_value)
                    : '',
            starts_at: initialValues.starts_at ?? '',
            ends_at: initialValues.ends_at ?? '',
            is_active: initialValues.is_active ?? false,
        });
        setImageUri(initialValues.image_uri ?? null);
    }, [initialValues]);



    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const openDatePicker = (field: 'starts_at' | 'ends_at') => {
        const currentValue = formData[field];

        const date = currentValue
            ? new Date(currentValue)
            : new Date();

        setPickerDate(
            Number.isNaN(date.getTime()) ? new Date() : date
        );

        setPickerField(field);
        setPickerMode('date');
    };

    const handleDateTimeChange = (
        _event: DateTimePickerChangeEvent,
        selectedDate: Date,
    ) => {
        if (!pickerField) {
            return;
        }

        if (pickerMode === 'date') {
            setPickerDate(selectedDate);
            setPickerMode('time');
            return;
        }

        setPickerDate(selectedDate);
        handleChange(pickerField, selectedDate.toISOString());
        setPickerField(null);
        setPickerMode('date');
    };

    const handlePickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Photo Access Required',
                'Please allow photo access so you can choose a promotion image.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.85,
        });

        if (result.canceled) {
            return;
        }

        const selectedImage = result.assets[0];

        if (!selectedImage?.uri) {
            return;
        }

        setImageUri(selectedImage.uri);
    };

    const validateForm = (): string | null => {
        if (!formData.title.trim()) {
            return 'Please enter a promotion title.';
        }

        if (!formData.message.trim()) {
            return 'Please enter a promotion message.';
        }

        if (!formData.starts_at.trim()) {
            return 'Please enter a start date.';
        }

        if (!formData.ends_at.trim()) {
            return 'Please enter an end date.';
        }
        if (formData.discount_type) {
            const discountValue = Number(formData.discount_value);

            if (!formData.discount_value.trim()) {
                return 'Please enter a discount value.';

            }

            if (!Number.isFinite(discountValue) || discountValue <= 0) {
                return 'Discount value must be greater than 0.';
            }

            if (
                formData.discount_type === 'percentage' &&
                discountValue > 100
            ) {
                return 'Percentage discount cannot be greater than 100%.';

            }
        }

        const startsAt = new Date(formData.starts_at);
        const endsAt = new Date(formData.ends_at);

        if (Number.isNaN(startsAt.getTime())) {
            return 'Please enter a valid start date.';
        }

        if (Number.isNaN(endsAt.getTime())) {
            return 'Please enter a valid end date.';
        }

        if (endsAt <= startsAt) {
            return 'The end date must be after the start date.';
        }

        if (
            formData.is_active &&
            endsAt <= new Date()
        ) {
            return 'An expired promotion cannot be activated.';
        }

        return null;
    };

    const handleSubmit = () => {
        if (isLoading) return;
        const validationError = validateForm();

        if (validationError) {
            Alert.alert('Invalid Promotion', validationError);
            return;
        }

        onSubmit({
            ...formData,
            title: formData.title.trim(),
            message: formData.message.trim(),
            image_uri: imageUri,
            discount_text: formData.discount_text.trim(),
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Pressable
                                style={styles.backButton}
                                onPress={onCancel}
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                                hitSlop={8}
                            >
                                <ChevronLeft
                                    size={24}
                                    color={colors.text.primary}
                                    strokeWidth={1.8}
                                />
                            </Pressable>

                            <Text style={styles.formTitle}>{title}</Text>
                        </View>

                        {/* Promotion Title */}
                        <TextInput
                            style={styles.input}
                            placeholder="Promotion Title"
                            placeholderTextColor={colors.text.muted}
                            value={formData.title}
                            onChangeText={(val) => handleChange('title', val)}
                        />

                        {/* Message */}
                        <TextInput
                            style={[styles.input, styles.multiline]}
                            placeholder="Message"
                            placeholderTextColor={colors.text.muted}
                            value={formData.message}
                            onChangeText={(val) => handleChange('message', val)}
                            multiline
                        />

                        {/* Promotion Image */}
                        <View style={styles.imageSection}>
                            <Text style={styles.label}>Promotion Image</Text>

                            {imageUri ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.imagePreview}
                                        resizeMode="cover"
                                    />

                                    <View style={styles.imageActions}>
                                        <Pressable
                                            style={styles.imageActionButton}
                                            onPress={handlePickImage}
                                            accessibilityRole="button"
                                            accessibilityLabel="Replace promotion image"
                                        >
                                            <RefreshCw
                                                size={16}
                                                color="#FAFAFA"
                                                strokeWidth={2.2}
                                            />
                                            <Text style={styles.imageActionText}>
                                                Replace
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            style={[
                                                styles.imageActionButton,
                                                styles.removeImageButton,
                                            ]}
                                            onPress={() => setImageUri(null)}
                                            accessibilityRole="button"
                                            accessibilityLabel="Remove promotion image"
                                        >
                                            <X
                                                size={16}
                                                color={colors.status.error}
                                                strokeWidth={1.8}
                                            />
                                            <Text
                                                style={[
                                                    styles.imageActionText,
                                                    styles.removeImageText,
                                                ]}
                                            >
                                                Remove
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <Pressable
                                    style={styles.imagePicker}
                                    onPress={handlePickImage}
                                    accessibilityRole="button"
                                    accessibilityLabel="Add promotion image"
                                >
                                    <View style={styles.imagePickerIcon}>
                                        <ImagePlus
                                            size={24}
                                            color={colors.gold.DEFAULT}
                                            strokeWidth={1.6}
                                        />
                                    </View>

                                    <Text style={styles.imagePickerTitle}>
                                        Add Promotion Image
                                    </Text>

                                    <Text style={styles.imagePickerHint}>
                                        Choose a jewelry image for this promotion
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Discount Text */}
                        <TextInput
                            style={styles.input}
                            placeholder="Discount Text (optional)"
                            placeholderTextColor={colors.text.muted}
                            value={formData.discount_text}
                            onChangeText={(val) => handleChange('discount_text', val)}
                        />
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Discount Type</Text>
                            <View style={styles.discountTypeRow}>
                                <Pressable
                                    style={[
                                        styles.discountTypeButton,
                                        formData.discount_type === 'percentage' &&
                                        styles.discountTypeButtonActive,
                                    ]}
                                    onPress={() =>
                                        setFormData((current) => ({
                                            ...current,
                                            discount_type: 'percentage',
                                        }))
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.discountTypeText,
                                            formData.discount_type === 'percentage' &&
                                            styles.discountTypeTextActive,
                                        ]}
                                    >
                                        Percentage
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.discountTypeButton,
                                        formData.discount_type === 'fixed' &&
                                        styles.discountTypeButtonActive,
                                    ]}
                                    onPress={() =>
                                        setFormData((current) => ({
                                            ...current,
                                            discount_type: 'fixed',
                                        }))
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.discountTypeText,
                                            formData.discount_type === 'fixed' &&
                                            styles.discountTypeTextActive,
                                        ]}
                                    >
                                        Fixed Amount
                                    </Text>
                                </Pressable>
                            </View>
                        </View>


                        <GoldInput
                            label={
                                formData.discount_type === 'percentage'
                                    ? 'Discount Value (%)'
                                    : formData.discount_type === 'fixed'
                                        ? 'Discount Value (₱)'
                                        : 'Discount Value'
                            }
                            value={formData.discount_value}
                            onChangeText={(text) => {
                                const sanitized = text.replace(/[^0-9.]/g, '');

                                if (
                                    formData.discount_type === 'percentage' &&
                                    Number(sanitized) > 100
                                ) {
                                    return;
                                }

                                setFormData((prev) => ({
                                    ...prev,
                                    discount_value: sanitized,
                                }));
                            }}
                            placeholder={
                                formData.discount_type === 'percentage'
                                    ? 'e.g. 20'
                                    : 'e.g. 500'
                            }
                            keyboardType="decimal-pad"
                        />


                        {/* Start Date */}
                        <Pressable
                            style={styles.dateInput}
                            onPress={() => openDatePicker('starts_at')}
                            accessibilityRole="button"
                            accessibilityLabel="Select start date and time"
                        >
                            <Text
                                style={[
                                    styles.dateInputText,
                                    !formData.starts_at && styles.datePlaceholder,
                                ]}
                            >
                                {formData.starts_at
                                    ? formatDateTime(formData.starts_at)
                                    : 'Start Date & Time'}
                            </Text>
                        </Pressable>

                        {/* End Date */}
                        <Pressable
                            style={styles.dateInput}
                            onPress={() => openDatePicker('ends_at')}
                            accessibilityRole="button"
                            accessibilityLabel="Select end date and time"
                        >
                            <Text
                                style={[
                                    styles.dateInputText,
                                    !formData.ends_at && styles.datePlaceholder,
                                ]}
                            >
                                {formData.ends_at
                                    ? formatDateTime(formData.ends_at)
                                    : 'End Date & Time'}
                            </Text>
                        </Pressable>

                        {pickerField ? (
                            <DateTimePicker
                                value={pickerDate}
                                mode={pickerMode}
                                display="default"
                                onValueChange={handleDateTimeChange}
                                onDismiss={() => {
                                    setPickerField(null);
                                    setPickerMode('date');
                                }}
                            />
                        ) : null}

                        {/* Active Toggle */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Active</Text>
                            <Switch
                                value={formData.is_active}
                                onValueChange={(val) => handleChange('is_active', val)}
                                trackColor={{
                                    false: colors.border.subtle,
                                    true: colors.gold.muted,
                                }}
                                thumbColor={
                                    formData.is_active ? colors.gold.DEFAULT : colors.text.secondary
                                }
                                ios_backgroundColor={colors.border.subtle}
                            />
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Pressable style={styles.cancelButton} onPress={onCancel}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                            <GoldButton
                                title={isLoading ? 'Uploading...' : title === 'Edit Promotion' ? 'Save Changes' : 'Create Promotion'}
                                variant="gradient"
                                size="lg"
                                onPress={handleSubmit}
                                disabled={isLoading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function formatDateTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Select date & time';
    }

    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function createStyles(colors: ReturnType<typeof useAppTheme>['colors']) {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.primary,
        },
        keyboardAvoidingView: {
            flex: 1,
        },

        scrollView: {
            flex: 1,
        },

        scrollContent: {
            flexGrow: 1,
            paddingBottom: 32,
        },
        container: {
            flex: 1,
            paddingHorizontal: 16,
            backgroundColor: colors.primary,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 48,
            marginBottom: 12,
        },
        backButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -8,
            marginRight: 4,
        },
        formTitle: {
            flex: 1,
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 22,
            color: colors.text.primary,
        },
        imageSection: {
            marginBottom: 16,
        },

        imagePicker: {
            minHeight: 150,
            borderRadius: 14,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.gold.muted,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 24,
        },

        imagePickerIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.gold.muted,
            marginBottom: 10,
        },

        imagePickerTitle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
            color: colors.text.primary,
            marginBottom: 4,
        },

        imagePickerHint: {
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            color: colors.text.muted,
            textAlign: 'center',
        },

        imagePreviewContainer: {
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border.subtle,
        },

        imagePreview: {
            width: '100%',
            height: 170,
        },

        imageActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 10,
            paddingVertical: 10,
        },

        imageActionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 8,
            backgroundColor: colors.gold.muted,
        },

        imageActionText: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: colors.text.primary,
        },

        removeImageButton: {
            backgroundColor: `${colors.status.error}12`,
        },

        removeImageText: {
            color: colors.status.error,
        },
        input: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.text.primary,
            marginBottom: 12,
        },
        multiline: {
            minHeight: 80,
            textAlignVertical: 'top',
        },
        fieldGroup: {
            marginBottom: 16,
        },
        label: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 12,
            color: colors.text.secondary,
            marginBottom: 8,
        },
        discountTypeRow: {
            flexDirection: 'row',
            gap: 10,
        },
        discountTypeButton: {
            flex: 1,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.subtle,
            backgroundColor: colors.surface,
        },
        discountTypeButtonActive: {
            borderColor: colors.gold.DEFAULT,
            backgroundColor: colors.gold.DEFAULT,
        },
        discountTypeText: {
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            color: colors.text.secondary,
        },
        discountTypeTextActive: {
            color: '#FFFFFF',
            fontFamily: 'Inter_600SemiBold',
        },
        dateInput: {
            backgroundColor: colors.surface,
            borderRadius: 8,
            minHeight: 48,
            paddingHorizontal: 12,
            justifyContent: 'center',
            marginBottom: 12,
        },

        dateInputText: {
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.text.primary,
        },

        datePlaceholder: {
            color: colors.text.muted,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        toggleLabel: {
            fontFamily: 'Inter_500Medium',
            fontSize: 15,
            color: colors.text.primary,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingBottom: 8,
        },
        cancelButton: {
            paddingVertical: 12,
            paddingHorizontal: 20,
        },
        cancelText: {
            fontFamily: 'Inter_500Medium',
            fontSize: 15,
            color: colors.text.secondary,
        },
    });
}
