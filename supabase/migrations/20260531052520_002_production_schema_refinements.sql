/*
  # Schema Refinements and Optimizations
  
  1. Adds missing columns to products (sku, slug, tags, stone details, gender, condition)
  2. Separates product images into normalized table
  3. Normalizes cart and order structures
  4. Improves security policies with staff role
  5. Adds comprehensive indexes
  6. Adds update_at triggers
*/

-- Drop existing tables and recreate with improved schema
-- (Since we're replacing the initial schema)

DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS shipping_addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_number text,
  role text NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer','staff','admin')),
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  slug text UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  price_php integer NOT NULL CHECK (price_php > 0),
  gold_purity text NOT NULL,
  weight_grams numeric(8,2) CHECK (weight_grams > 0),
  stone_type text,
  stone_weight_ct numeric(6,2) CHECK (stone_weight_ct >= 0),
  color text,
  gender text,
  condition text DEFAULT 'brand_new'
    CHECK (condition IN ('brand_new','pre_owned')),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  available_sizes text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_new boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRODUCT IMAGES TABLE
-- ============================================================================
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SHIPPING ADDRESSES TABLE
-- ============================================================================
CREATE TABLE shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CART ITEMS TABLE
-- ============================================================================
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- WISHLIST TABLE
-- ============================================================================
CREATE TABLE wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  shipping_address_id uuid REFERENCES shipping_addresses(id) ON DELETE SET NULL,
  subtotal_php integer NOT NULL CHECK (subtotal_php >= 0),
  shipping_fee_php integer DEFAULT 0 CHECK (shipping_fee_php >= 0),
  total_amount_php integer NOT NULL CHECK (total_amount_php >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('gcash','maya','bank_transfer','cash')),
  payment_status text DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status text DEFAULT 'pending'
    CHECK (order_status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price_php integer NOT NULL CHECK (price_php > 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal_php integer NOT NULL CHECK (subtotal_php > 0)
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INQUIRIES TABLE
-- ============================================================================
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new'
    CHECK (status IN ('new','read','replied','closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS
-- ============================================================================

CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff','admin')
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- PRODUCTS: Public read active products, staff manages all
CREATE POLICY "public_products_read"
  ON products FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "staff_products_all"
  ON products FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- PRODUCT IMAGES: Public read, staff manages
CREATE POLICY "public_images_read"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "staff_images_all"
  ON product_images FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- PROFILES: Users manage own, staff manages all
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_staff());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'customer');

-- SHIPPING ADDRESSES: Users manage own
CREATE POLICY "shipping_own"
  ON shipping_addresses FOR ALL
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- CART ITEMS: Users manage own
CREATE POLICY "cart_own"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- WISHLIST: Users manage own
CREATE POLICY "wishlist_own"
  ON wishlist FOR ALL
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- ORDERS: Customers see own, staff manages all
CREATE POLICY "orders_customer_read"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR is_staff());

CREATE POLICY "orders_customer_insert"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "orders_staff_all"
  ON orders FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- ORDER ITEMS: Linked to order ownership
CREATE POLICY "order_items_read"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND (o.customer_id = auth.uid() OR is_staff())
    )
  );

CREATE POLICY "order_items_staff_all"
  ON order_items FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- INQUIRIES: Users manage own, staff manages all
CREATE POLICY "inquiries_customer_insert"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "inquiries_customer_read"
  ON inquiries FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id OR is_staff());

CREATE POLICY "inquiries_staff_all"
  ON inquiries FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_tags ON products USING GIN(tags);

CREATE INDEX idx_product_images_product_id ON product_images(product_id, display_order);

CREATE INDEX idx_cart_customer_id ON cart_items(customer_id);

CREATE INDEX idx_wishlist_customer_id ON wishlist(customer_id);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
