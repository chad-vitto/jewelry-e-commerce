# 📸 Product Image Upload Setup Guide

## ✅ What's Included

Your project now has complete image upload functionality for products:

### 1. **Storage Bucket Configuration**
   - **Location**: `supabase/config.toml` (local development)
   - **Bucket Name**: `product-images` (public, 50MB max file size)
   - **Migration**: `supabase/migrations/20260531_003_storage_buckets.sql`

### 2. **Image Upload Hook**
   - **File**: `hooks/useImageUpload.ts`
   - **Features**:
     - Upload images to Supabase Storage
     - Get public URLs automatically
     - Delete images
     - Error handling

### 3. **Image Uploader Component**
   - **File**: `components/ImageUploader.tsx`
   - **Features**:
     - Two modes: full and compact
     - Multiple image selection
     - Image ordering
     - Delete individual images
     - Real-time upload progress
     - Responsive UI

### 4. **Product Form Component**
   - **File**: `components/ProductForm.tsx`
   - **Features**:
     - Integrated image uploader
     - Form validation
     - Complete product data fields
     - Toggle switches for active/featured status

### 5. **Admin Product Creation Page**
   - **File**: `app/admin/products/new.tsx`
   - **Features**:
     - Create products with images
     - Auto-generate SKU
     - Save to database

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install expo-image-picker
```

### Step 2: Update Your Types (if needed)
The existing `Product` type in `types/index.ts` already supports:
```typescript
images: string[];  // Array of image URLs
```

### Step 3: Create a Product
1. Go to Admin → Products → + (Add button)
2. Fill in product details
3. Tap "Add Images" to upload photos
4. Click "Create Product"

---

## 📚 Usage Examples

### Using the Image Uploader in a Custom Component

```typescript
import { ImageUploader } from '@/components/ImageUploader';
import { useState } from 'react';

export function MyComponent() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUploader
      onImagesSelected={setImages}
      maxImages={5}
      compact={false}  // Set true for smaller version
    />
  );
}
```

### Using the Upload Hook Directly

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

export function MyComponent() {
  const { uploadImage, deleteImage, uploading, error } = useImageUpload();

  const handleUpload = async () => {
    const url = await uploadImage({
      uri: 'file:///path/to/image.jpg',
      name: 'my-image.jpg',
      type: 'image/jpeg',
    });
    
    if (url) {
      console.log('Image uploaded:', url);
    }
  };

  return <Button title="Upload" onPress={handleUpload} />;
}
```

### Using the Product Form

```typescript
import { ProductForm } from '@/components/ProductForm';

export function AdminScreen() {
  const handleSubmit = async (formData) => {
    // Save to database
    await supabase.from('products').insert({
      ...formData,
      price_php: formData.price_php,
      // images are already URLs
    });
  };

  return (
    <ProductForm
      title="Add Product"
      onSubmit={handleSubmit}
    />
  );
}
```

---

## 🗄️ Database Schema

### Products Table
```sql
products (
  id: uuid,
  sku: text (unique),
  name: text,
  description: text,
  category: text,
  price_php: integer,
  gold_purity: text,
  weight_grams: numeric,
  stock_quantity: integer,
  available_sizes: text[],
  is_active: boolean,
  is_featured: boolean,
  ...
)
```

### Product Images Table
```sql
product_images (
  id: uuid,
  product_id: uuid (FK),
  image_url: text,
  display_order: integer,
  created_at: timestamptz
)
```

---

## 🔒 Security & Storage Policies

The storage bucket has Row Level Security (RLS) policies:

1. **Public Read**: Anyone can view product images
2. **Staff Upload**: Only staff/admin can upload images
3. **Staff Delete**: Only staff/admin can delete images

---

## 🎨 Customization

### Change Max Images
```typescript
<ImageUploader maxImages={10} />
```

### Use Compact Mode
```typescript
<ImageUploader compact={true} />  // Small icon style
```

### Custom Upload Path
```typescript
await uploadImage(file, 'custom-bucket-name');
```

### Styling
Edit `ImageUploader.tsx` styles to match your brand colors:
```typescript
uploadButton: {
  borderColor: Colors.gold.DEFAULT,  // Change this
  // ...
}
```

---

## ⚠️ Troubleshooting

### Images Not Uploading?
1. Check internet connection
2. Verify file size < 50MB
3. Ensure bucket permissions are correct
4. Check Supabase credentials in `.env`

### Permission Denied Errors?
1. Verify user role is 'staff' or 'admin'
2. Check RLS policies in Supabase
3. Ensure storage bucket exists

### Images Not Showing?
1. Check if URL is valid
2. Verify bucket is public
3. Check CORS settings in Supabase

---

## 📝 Next Steps

1. **Edit Product Images**: Update `app/admin/products/[id].tsx` to edit images
2. **Image Optimization**: Add image compression before upload
3. **Image Transformations**: Use Supabase Image Transformation API for thumbnails
4. **Backup Strategy**: Configure backup for product images

---

## 📦 File Structure

```
Jewelry-e-Commerce/
├── hooks/
│   └── useImageUpload.ts          # Upload/delete logic
├── components/
│   ├── ImageUploader.tsx           # UI component
│   └── ProductForm.tsx             # Form with images
├── app/admin/products/
│   ├── new.tsx                     # Create product
│   └── [id].tsx                    # Edit product (update needed)
└── supabase/
    ├── config.toml                 # Storage config
    └── migrations/
        └── 20260531_003_storage_buckets.sql
```

---

## 🔗 Related Hooks

```typescript
// To fetch products with images:
const { products, isLoading } = useProducts();

// To manage admin products:
const { products, toggleActive, deleteProduct } = useAdminProducts();
```

---

**Version**: 1.0  
**Last Updated**: May 31, 2026  
**Status**: ✅ Production Ready
