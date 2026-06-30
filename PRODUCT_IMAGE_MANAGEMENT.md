# Product Image Management Guide

## Overview
The admin/staff can now upload, manage, reorder, and delete product images through the Admin Dashboard. All image operations are performed through a dedicated image management interface.

## Storage Configuration
- Images are stored in the Supabase Storage bucket: `product-images`
- Image metadata is tracked in the `product_images` database table
- RLS policies allow staff/admin to upload and manage images

## How to Manage Product Images

### 1. Access Image Manager
From the admin dashboard:
1. Go to **Manage Products** in the Quick Actions
2. Find the product you want to manage
3. Click the **Image Icon** (🖼️) button in the product row
4. This opens the dedicated Image Manager screen

### 2. Upload Images
**Method 1: Quick Upload**
- Click the **Upload** button in the header
- Select an image from your device
- Image is automatically uploaded and added to the product

**Method 2: Action Button**
- Scroll to the bottom of the image list
- Click **Upload New Image**
- Select and confirm the image

### 3. Reorder Images
Images appear in order on the product detail page (first image is the thumbnail):
1. Each image shows its position number in the top-right corner
2. Use the **up arrow** (↑) to move an image earlier in the display order
3. Use the **down arrow** (↓) to move an image later in the display order
4. Reordering updates immediately in the database

### 4. Delete Images
1. Find the image you want to delete
2. Click the **trash icon** (🗑️) in the bottom-right corner
3. Confirm the deletion
4. Image is removed from both storage and database

### 5. Image Features
- **Auto-crop to square**: Images are automatically cropped to 1:1 aspect ratio for consistency
- **Optimized storage**: Images are compressed to 80% quality to save storage space
- **Public URLs**: Images are publicly accessible via Supabase CDN
- **Display order**: Control which image appears first on product pages
- **Batch operations**: Upload multiple images one after another

## Technical Details

### Storage Permissions
The RLS policies allow:
- **Authenticated users**: Can upload to their own subfolder
- **Staff/Admin**: Can upload to any product folder
- **Public**: Can view all product images (no authentication required)

### File Naming
Uploaded images are automatically named using:
- Product ID
- Timestamp
- File extension (.jpg)

Example: `product-123-1706831200000.jpg`

### Database Structure
The `product_images` table tracks:
- `id`: Unique image identifier
- `product_id`: Reference to the product
- `image_url`: Public URL to the image
- `display_order`: Order in which images appear
- `created_at`: Upload timestamp

### Limits
- File size: Up to 5MB per image
- Supported formats: JPG, PNG, WebP
- No limit on number of images per product
- Storage quota: Depends on your Supabase plan

## Troubleshooting

### Upload Fails
**Check permissions:**
1. Verify your account is set to "Admin" or "Staff" role in the User Management page
2. Ensure you have an active internet connection
3. Try uploading a smaller image

**Check storage:**
1. Verify the Supabase storage bucket `product-images` exists
2. Check that your Supabase project isn't at storage quota

### Images Don't Appear
1. Refresh the app or navigate away and back
2. Check image URL is accessible in browser
3. Clear app cache and reload

### Can't Delete Image
1. Verify you're logged in as Admin or Staff
2. Refresh the app and try again
3. Check error message in the app logs

## Best Practices

1. **Use High-Quality Images**
   - Use images with good lighting and clarity
   - Minimum 800x800px recommended (will be optimized)
   - Use a consistent background for all product images

2. **Consistent Ordering**
   - Place the best angle/view first
   - Follow with different perspectives
   - Place detail shots last

3. **Image Count**
   - Use 3-5 images per product for optimal user experience
   - Include multiple angles if product has distinctive features
   - Include close-ups of important details (gems, hallmarks, etc.)

4. **File Management**
   - Keep local copies of original images for backup
   - Use consistent naming conventions on your device
   - Organize images by product before uploading

## Permissions

Only users with these roles can manage product images:
- **Admin**: Full access to all products and images
- **Staff**: Can manage images for all products

**Customers** cannot upload or manage images.

To change user roles, see the User Management guide in the admin dashboard.
