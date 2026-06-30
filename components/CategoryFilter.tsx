import React, { useEffect, useMemo, useRef } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  View,
  Dimensions,
} from 'react-native';
import { Category, ProductCategory } from '@/types';
import { CATEGORIES, Colors } from '@/constants';
import { Image } from 'expo-image';

interface CategoryFilterProps {
  selected: ProductCategory | 'all';
  onSelect: (category: ProductCategory | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const allCategories = useMemo(
    () => [{ id: 'all', name: 'All', slug: 'all' }, ...CATEGORIES],
    [],
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const screenWidth = Dimensions.get('window').width;

  // Auto scroll when selected
  useEffect(() => {
    const selectedIndex = allCategories.findIndex(
      (category) => category.id === selected,
    );

    if (selectedIndex !== -1) {
      const itemWidth = 96; // 80 width + 16 margin
      const centerOffset = screenWidth / 2 - itemWidth / 2;

      scrollViewRef.current?.scrollTo({
        x: Math.max(0, selectedIndex * itemWidth - centerOffset),
        animated: true,
      });
    }
  }, [selected, allCategories, screenWidth]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      style={styles.scrollView}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allCategories.map((category) => {
        const isSelected = selected === category.id;
        const isAll = category.id === 'all';

        return (
          <Pressable
            key={category.id}
            style={styles.categoryItem}
            onPress={() => onSelect(category.id as ProductCategory | 'all')}
            accessibilityLabel={`Filter by ${category.name}`}
            accessibilityState={{ selected: isSelected }}
          >
            {isAll ? (
              <View
                style={[
                  styles.imageWrapper,
                  isSelected && styles.imageWrapperActive,
                  isSelected && styles.imageWrapperScaled,
                ]}
              >
                <Text style={styles.allText}>All</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.imageWrapper,
                  isSelected && styles.imageWrapperActive,
                  isSelected && styles.imageWrapperScaled,
                ]}
              >
                <Image
                  //key={`${category.id}-${isSelected}`}
                  source={{ uri: (category as Category).image }}
                  style={styles.categoryImage}
                  contentFit="cover"
                  transition={0}
                />
              </View>
            )}

            <Text
              style={[
                styles.categoryName,
                isSelected && styles.categoryNameActive,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },

  allText: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gold.DEFAULT,
  },

  categoryName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.text.secondary,
    fontFamily: 'Inter_500Medium',
  },

  categoryNameActive: {
    color: Colors.gold.DEFAULT,
    fontFamily: 'Inter_600SemiBold',
  },

  imageWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageWrapperActive: {
    borderWidth: 3,
    borderColor: Colors.gold.DEFAULT,
    borderRadius: 38, // explicitly repeat
  },

  categoryImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },

  imageWrapperScaled: {
    transform: [{ scale: 1.08 }],
  },

  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
    height: 120,
    maxHeight: 120,
  },
});
