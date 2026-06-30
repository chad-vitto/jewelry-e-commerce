import React, { useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react-native';
import { CATEGORIES, Colors, formatCurrency, Shadows } from '@/constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductCarousel, ProductGrid, SectionSkeleton } from '@/components';
import { ProductCategory } from '@/types';
import { useFeaturedProducts, useProducts } from '@/hooks';
import { useRouter } from 'expo-router';
import { useWishlistStore } from '@/store';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native';
import TrustBanner from '@/components/TrustBanner';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.5;

export default function HomeScreen() {
  const router = useRouter();

  const {
    products: featuredProducts,
    isLoading: featuredLoading,
    refetch: refetchFeatured,
  } = useFeaturedProducts();

  const {
    products: allProducts,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useProducts();

  const { productIds: wishlistIds, toggleItem: toggleWishlist } =
    useWishlistStore();

  const [refreshing, setRefreshing] = useState(false);

  const newArrivals = [...allProducts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  const bestSellers = allProducts.filter((p) => p.is_best_seller).slice(0, 6);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await Promise.all([refetchProducts(), refetchFeatured()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProducts, refetchFeatured]);

  const handleWishlistToggle = (productId: string) => {
    toggleWishlist(productId);
  };

  const handleCategoryPress = (id: ProductCategory | 'all') => {
    if (id !== 'all') {
      router.navigate({
        pathname: '/shop',
        params: { category: id },
      });
    } else {
      router.push('/shop');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold.DEFAULT}
            colors={[Colors.gold.DEFAULT]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source="https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=1200"
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', Colors.primary + 'CC', Colors.primary]}
            locations={[0.3, 0.7, 1]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTagline}>Timeless Elegance in Gold</Text>
            <Text style={styles.heroTitle}>ReLoved Gold</Text>
            <Text style={styles.heroSubtitle}>
              Curated Pre-Loved Gold. Pure Quality. Affordable.
            </Text>

            <Pressable
              style={styles.heroCta}
              onPress={() => router.push('/shop')}
            >
              <Text style={styles.heroCtaText}>Explore Collection</Text>
              <ArrowRight size={22} color={Colors.primary} />
            </Pressable>
          </View>
        </View>
        {/* Trust Banner */}
        <TrustBanner />

        {/* Categories Strip */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  handleCategoryPress(category.id as ProductCategory)
                }
              >
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                  contentFit="cover"
                />

                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={StyleSheet.absoluteFill}
                />

                <Text style={styles.categoryName}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        {featuredLoading ? (
          <SectionSkeleton />
        ) : (
          featuredProducts.length > 0 && (
            <ProductCarousel
              title="Featured Pieces"
              products={featuredProducts}
              showSeeAll
              onSeeAll={() => router.push('/shop')}
              wishlistIds={wishlistIds}
              onWishlistToggle={handleWishlistToggle}
            />
          )
        )}

        {/* New Arrivals */}
        {productsLoading ? (
          <SectionSkeleton />
        ) : (
          newArrivals.length > 0 && (
            <ProductCarousel
              title="New Arrivals"
              products={newArrivals}
              showSeeAll
              onSeeAll={() => router.push('/shop')}
              wishlistIds={wishlistIds}
              onWishlistToggle={handleWishlistToggle}
            />
          )
        )}

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={Colors.gold.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoTitle}>Free Shipping</Text>

            <Text style={styles.promoText}>
              On orders over {formatCurrency(10000)}
            </Text>

            <Pressable onPress={() => router.push('/shop')}>
              <Text style={styles.promoCta}>Shop now →</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Best Sellers */}
        {productsLoading ? (
          <SectionSkeleton />
        ) : (
          bestSellers.length > 0 && (
            <View style={styles.bestSellersSection}>
              <ProductGrid
                title="Best Sellers"
                products={bestSellers}
                wishlistIds={wishlistIds}
                onWishlistToggle={handleWishlistToggle}
              />
            </View>
          )
        )}

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT * 1.2,
    position: 'absolute',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 24,
  },
  heroTagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.gold.light,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 48,
    color: Colors.text.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold.DEFAULT,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroCtaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
  categoriesSection: {
    marginTop: 8,
    marginBottom: 1,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.text.primary,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },

  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryCard: {
    width: 120,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: Colors.surface,
  },

  categoryImage: {
    width: '100%',
    height: '100%',
  },

  categoryName: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  promoBanner: {
    padding: 16,
    paddingBottom: 25,
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.lg,

    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)', // soft gold tint
  },
  promoGradient: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',

    borderRadius: 14,
  },
  promoTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: Colors.primary,
    marginBottom: 4,
  },
  promoText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  promoCta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  bestSellersSection: {
    marginBottom: 24,
  },
});
