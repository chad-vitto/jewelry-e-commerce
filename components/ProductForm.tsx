import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Colors } from '@/constants';
import { ImageUploader } from './ImageUploader';
import { GoldButton } from './GoldGradient';
import { CategoryFilter } from './CategoryFilter';
import { Product, ProductCategory, ProductImage } from '@/types';

export type ProductImageInsert = {
  image_url: string;
  display_order: number;
};

interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;

  price_php: string;
  gold_purity: string;
  weight_grams: string;
  stock_quantity: string;

  product_images: string[];
  available_sizes: string;

  is_featured: boolean;
  is_active: boolean;
}

interface ProductSubmitData {
  name: string;
  description: string;
  category: ProductCategory;
  price_php: number;
  gold_purity: string;
  weight_grams: number;
  stock_quantity: number;
  available_sizes: string[];
  is_featured: boolean;
  is_active: boolean;
  product_images: ProductImageInsert[];
}
interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductSubmitData) => Promise<void>;
  isLoading?: boolean;
  title: string;
}
type FormErrors = {
  name?: string;
  description?: string;
  price_php?: string;
  weight_grams?: string;
  stock_quantity?: string;
  product_images?: string;
};

export const ProductForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  title,
}: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    category: (initialData?.category as ProductCategory) ?? 'rings',

    price_php: initialData?.price_php?.toString() ?? '',
    gold_purity: initialData?.gold_purity ?? '',
    weight_grams: initialData?.weight_grams?.toString() ?? '',
    stock_quantity: initialData?.stock_quantity?.toString() ?? '',

    product_images:
      initialData?.product_images?.map((img: ProductImage) => img.image_url) ??
      [],

    available_sizes: initialData?.available_sizes?.join(', ') ?? '',

    is_featured: initialData?.is_featured ?? false,
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.price_php || parseFloat(formData.price_php) <= 0)
      newErrors.price_php = 'Valid price is required';
    if (!formData.weight_grams || parseFloat(formData.weight_grams) <= 0)
      newErrors.weight_grams = 'Valid weight is required';
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0)
      newErrors.stock_quantity = 'Valid stock quantity is required';
    if (!formData.product_images?.length)
      newErrors.product_images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      const sizesArray = formData.available_sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSubmit({
        name: formData.name,
        description: formData.description,
        category: formData.category,

        price_php: parseFloat(formData.price_php),

        gold_purity: formData.gold_purity,

        weight_grams: parseFloat(formData.weight_grams),

        stock_quantity: parseInt(formData.stock_quantity, 10),

        product_images: formData.product_images.map((url, index) => ({
          image_url: url,
          display_order: index,
        })),

        available_sizes: sizesArray,

        is_featured: formData.is_featured,
        is_active: formData.is_active,
      });
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to save product',
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <ImageUploader
          initialImages={formData.product_images}
          onImagesSelected={(images: string[]) =>
            setFormData({ ...formData, product_images: images })
          }
        />
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter product name"
              placeholderTextColor={Colors.text.muted}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={!isLoading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="Enter product description"
              placeholderTextColor={Colors.text.muted}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              editable={!isLoading}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Category</Text>
              <CategoryFilter
                selected={formData.category}
                onSelect={(category) =>
                  setFormData({
                    ...formData,
                    category: category as ProductCategory,
                  })
                }
              />
            </View>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Gold Purity</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 18K, 24K"
                placeholderTextColor={Colors.text.muted}
                value={formData.gold_purity}
                onChangeText={(text) =>
                  setFormData({ ...formData, gold_purity: text })
                }
                editable={!isLoading}
              />
            </View>
          </View>
        </View>
        {/* Pricing & Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Price (₱)</Text>
              <TextInput
                style={[styles.input, errors.price_php && styles.inputError]}
                placeholder="0.00"
                placeholderTextColor={Colors.text.muted}
                value={formData.price_php}
                onChangeText={(text) =>
                  setFormData({ ...formData, price_php: text })
                }
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
              {errors.price_php && (
                <Text style={styles.errorText}>{errors.price_php}</Text>
              )}
            </View>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Stock Qty</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.stock_quantity && styles.inputError,
                ]}
                placeholder="0"
                placeholderTextColor={Colors.text.muted}
                value={formData.stock_quantity}
                onChangeText={(text) =>
                  setFormData({ ...formData, stock_quantity: text })
                }
                keyboardType="number-pad"
                editable={!isLoading}
              />
              {errors.stock_quantity && (
                <Text style={styles.errorText}>{errors.stock_quantity}</Text>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Weight (grams)</Text>
              <TextInput
                style={[styles.input, errors.weight_grams && styles.inputError]}
                placeholder="0.00"
                placeholderTextColor={Colors.text.muted}
                value={formData.weight_grams}
                onChangeText={(text) =>
                  setFormData({ ...formData, weight_grams: text })
                }
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
              {errors.weight_grams && (
                <Text style={styles.errorText}>{errors.weight_grams}</Text>
              )}
            </View>
            <View style={[styles.formGroup, styles.flex]}>
              <Text style={styles.label}>Available Sizes</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 6, 7, 8"
                placeholderTextColor={Colors.text.muted}
                value={formData.available_sizes}
                onChangeText={(text) =>
                  setFormData({ ...formData, available_sizes: text })
                }
                editable={!isLoading}
              />
            </View>
          </View>
        </View>
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Active</Text>
              <Text style={styles.toggleDescription}>
                Show product to customers
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, formData.is_active && styles.toggleActive]}
              onPress={() =>
                setFormData({ ...formData, is_active: !formData.is_active })
              }
              disabled={isLoading}
            >
              <View
                style={[
                  styles.toggleHandle,
                  formData.is_active && styles.toggleHandleActive,
                ]}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.label}>Featured</Text>
              <Text style={styles.toggleDescription}>
                Highlight on homepage
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                formData.is_featured && styles.toggleActive,
              ]}
              onPress={() =>
                setFormData({ ...formData, is_featured: !formData.is_featured })
              }
              disabled={isLoading}
            >
              <View
                style={[
                  styles.toggleHandle,
                  formData.is_featured && styles.toggleHandleActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Submit */}
        <GoldButton
          title={
            isLoading
              ? 'Saving...'
              : initialData
                ? 'Update Product'
                : 'Create Product'
          }
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        />
        <View style={styles.spacer} />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_700Bold',
    color: Colors.text.primary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.status.error,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  selectContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
  },
  selectText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.DEFAULT,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.gold.DEFAULT,
  },
  toggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text.muted,
    alignSelf: 'flex-start',
  },
  toggleHandleActive: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.text.muted,
    marginTop: 2,
  },
  submitButton: {
    marginTop: 24,
  },
  spacer: {
    height: 100,
  },
});
