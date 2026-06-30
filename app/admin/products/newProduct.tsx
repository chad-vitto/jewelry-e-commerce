import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ProductForm } from '@/components/ProductForm';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants';

export default function NewProductScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setIsLoading(true);

      const sku = `SKU-${Date.now()}`;

      // Create Product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          sku,
          slug: formData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-'),
          name: formData.name,
          description: formData.description,
          category: formData.category,

          price_php: formData.price_php,
          gold_purity: formData.gold_purity,
          weight_grams: formData.weight_grams,
          stock_quantity: formData.stock_quantity,

          available_sizes: formData.available_sizes,

          is_featured: formData.is_featured,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Save Product Images
      if (
        product &&
        formData.product_images &&
        formData.product_images.length > 0
      ) {
        const imageRows = formData.product_images.map((img: any) => ({
          product_id: product.id,
          image_url: img.image_url,
          display_order: img.display_order,
        }));

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageRows);

        if (imageError) throw imageError;
      }

      Alert.alert('Success', 'Product created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Error creating product:', err);

      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to create product',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ProductForm
        title="Create New Product"
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
});
