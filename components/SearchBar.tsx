import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Colors } from '@/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onFocus,
  onBlur,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={20} color={Colors.gold.DEFAULT} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.muted}
        style={styles.input}
        onFocus={onFocus}
        onBlur={onBlur}
        selectionColor={Colors.gold.DEFAULT}
        accessibilityLabel="Search products"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <X size={18} color={Colors.text.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
  },
  clearButton: {
    padding: 4,
  },
});
