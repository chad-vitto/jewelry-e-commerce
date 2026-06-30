// Database entity types

export type UserRole = 'customer' | 'staff' | 'admin';

export type ProductCategory = 'rings' | 'earrings' | 'necklaces' | 'pendants' | 'bracelets' | 'wedding_sets';

export type PaymentMethodType = 'gcash' | 'paymaya' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type InquiryStatus = 'new' | 'read' | 'replied'; 


export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
};

export interface Product {
  id: string;
  sku: string;
  slug: string;

  name: string;
  description: string;
  category: ProductCategory;

  price_php: number;
  gold_purity: string;
  weight_grams: number;

  stone_type?: string;
  stone_weight_ct?: number;

  color?: string;
  gender?: string;
  condition?: string;

  stock_quantity: number;
  available_sizes: string[];

  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;

  created_at: string;
  updated_at: string;

  product_images: ProductImage[];
   
};

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price_php: number;
  gold_purity: string;
  size?: string;
}

export interface ShippingAddressData {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
}

export interface ContactInfo {
  email: string;
  phone_number: string;
  notes?: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  items: OrderItem[];
  subtotal_php: number;
  shipping_fee_php: number;
  total_amount_php: number;
  payment_method: PaymentMethodType;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: ShippingAddressData;
  contact_info: ContactInfo;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_id: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface ShippingAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
}

// UI/App types

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  description?: string;
}

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: string;
  instructions: string;
  accountNumber: string;
  accountName: string;
  bankName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'bestsellers';
}

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

// Form types

export interface SignInForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number?: string;
}

export interface InquiryForm {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subject: string;
  message: string;
}

export interface AddressForm {
  label: string;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

// API Response types

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Navigation types

export type RootStackParamList = {
  '(tabs)': undefined;
  'product/[id]': { id: string };
  'cart': undefined;
  'checkout': undefined;
  'auth/sign-in': undefined;
  'auth/register': undefined;
  'auth/forgot-password': undefined;
  'admin': undefined;
  'admin/products': undefined;
  'admin/products/[id]': { id: string };
  'admin/products/newProduct': undefined;
  'admin/orders': undefined;
  'admin/orders/[id]': { id: string };
  'admin/inquiries': undefined;
  'admin/inquiries/[id]': { id: string };
};

// Component Prop types

export interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onWishlistToggle: () => void;
  isWishlisted: boolean;
}

export interface ProductGridProps {
  product: Product;
  onProductPress: (product: Product) => void;
  wishlistIds: string[];
  onWishlistToggle: (productId: string) => void;
  isLoading?: boolean;
}

export interface OrderSummaryProps {
  order: Order;
  isAdmin?: boolean;
}
