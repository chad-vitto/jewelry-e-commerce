import { Product } from '@/types';


const mockDate = '2026-01-01T00:00:00Z';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'RNG-001',
    slug: 'celestial-solitaire-ring',
    name: 'Celestial Solitaire Ring',
    description: 'Elegant 18K gold solitaire ring with brilliant center stone.',
    category: 'rings',
    price_php: 45000,
    gold_purity: '18K',
    weight_grams: 4.2,
    stone_type: 'Diamond',
    stone_weight_ct: 0.50,
    stock_quantity: 10,
    available_sizes: ['5', '6', '7', '8', '9'],
    is_active: true,
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-1',
        product_id: '1',
        image_url: 'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },

  {
    id: '2',
    sku: 'EAR-001',
    slug: 'gold-drop-earrings',
    name: 'Golden Drop Earrings',
    description: 'Classic 18K gold drop earrings perfect for daily wear.',
    category: 'earrings',
    price_php: 28000,
    gold_purity: '18K',
    weight_grams: 3.1,
    stock_quantity: 15,
    available_sizes: [],
    is_active: true,
    is_featured: true,
    is_best_seller: false,
    is_new: true,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-2',
        product_id: '2',
        image_url: 'https://images.pexels.com/photos/942878/pexels-photo-942878.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },

  {
    id: '3',
    sku: 'NEC-001',
    slug: 'royal-gold-necklace',
    name: 'Royal Gold Necklace',
    description: 'Luxury 18K gold necklace with timeless craftsmanship.',
    category: 'necklaces',
    price_php: 95000,
    gold_purity: '18K',
    weight_grams: 12.5,
    stock_quantity: 5,
    available_sizes: ['18"', '20"', '22"'],
    is_active: true,
    is_featured: true,
    is_best_seller: true,
    is_new: false,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-3',
        product_id: '3',
        image_url: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },

  {
    id: '4',
    sku: 'PEN-001',
    slug: 'cross-gold-pendant',
    name: 'Cross Gold Pendant',
    description: 'Beautiful handcrafted gold cross pendant.',
    category: 'pendants',
    price_php: 22000,
    gold_purity: '18K',
    weight_grams: 2.8,
    stock_quantity: 20,
    available_sizes: [],
    is_active: true,
    is_featured: false,
    is_best_seller: true,
    is_new: false,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-4',
        product_id: '4',
        image_url: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },

  {
    id: '5',
    sku: 'BRA-001',
    slug: 'classic-gold-bracelet',
    name: 'Classic Gold Bracelet',
    description: 'Premium gold bracelet with polished finish.',
    category: 'bracelets',
    price_php: 38000,
    gold_purity: '18K',
    weight_grams: 6.4,
    stock_quantity: 12,
    available_sizes: ['Small', 'Medium', 'Large'],
    is_active: true,
    is_featured: false,
    is_best_seller: false,
    is_new: true,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-5',
        product_id: '5',
        image_url: 'https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },

  {
    id: '6',
    sku: 'WED-001',
    slug: 'eternal-love-wedding-set',
    name: 'Eternal Love Wedding Set',
    description: 'Matching 18K gold wedding rings crafted for couples.',
    category: 'wedding_sets',
    price_php: 120000,
    gold_purity: '18K',
    weight_grams: 10.5,
    stock_quantity: 4,
    available_sizes: ['5', '6', '7', '8', '9', '10'],
    is_active: true,
    is_featured: true,
    is_best_seller: true,
    is_new: true,
    created_at: mockDate,
    updated_at: mockDate,
    product_images: [
      {
        id: 'img-6',
        product_id: '6',
        image_url: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg',
        display_order: 0,
        created_at: mockDate,
      },
    ],
  },
];

export const getFeaturedProducts = (): Product[] => {
  return MOCK_PRODUCTS.filter((p) => p.is_featured);
};

export const getNewArrivals = (): Product[] => {
  return [...MOCK_PRODUCTS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
};

export const getProductsByCategory = (category: string): Product[] => {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
};
