import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    icon: 'Gem',
    image: 'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/rings.png',
    description: 'Elegant gold rings for every occasion',
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    icon: 'Sparkles',
    image: 'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/earrings.png',
    description: 'Beautiful earrings to complement your style',
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    icon: 'Crown',
    image: 'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/necklaces.png',
    description: 'Stunning necklaces and chains',
  },
  {
    id: 'pendants',
    name: 'Pendants',
    slug: 'pendants',
    icon: 'Gem',
    image:
      'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/pendants.png',
    description: 'Elegant pendants and charms',
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    icon: 'Watch',
    image:
      'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/bracelets.png',
    description: 'Exquisite bracelets and bangles',
  },
  {
    id: 'wedding_sets',
    name: 'Wedding Sets',
    slug: 'wedding_sets',
    icon: 'Heart',
    image:
      'https://vgqlqzjpwnckwvpubrvb.supabase.co/storage/v1/object/public/categories/wedding_sets.png',
    description: 'Complete wedding jewelry sets',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category?.name ?? id;
};
