import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingBag, Search, Heart, AlertCircle } from 'lucide-react-native';
import { Colors } from '@/constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <ShoppingBag size={48} color={Colors.gold.DEFAULT} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<ShoppingBag size={48} color={Colors.gold.DEFAULT} />}
      title="Your Cart is Empty"
      message="Explore our exquisite collection and add timeless pieces to your cart."
      actionLabel="Browse Collection"
      onAction={onBrowse}
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search size={48} color={Colors.gold.DEFAULT} />}
      title="No Results Found"
      message={
        query
          ? `We couldn't find any products matching "${query}"`
          : 'Try adjusting your search or filters.'
      }
    />
  );
}

export function EmptyCategory({
  categoryName,
  onBrowse,
}: {
  categoryName?: string;
  onBrowse?: () => void;
}) {
  return (
    <EmptyState
      icon={<ShoppingBag size={48} color={Colors.gold.DEFAULT} />}
      title="No items available yet."
      message={
        categoryName
          ? `Check back soon for new arrivals in "${categoryName}".`
          : 'Try exploring other categories or check back later.'
      }
      actionLabel="Browse All Products"
      onAction={onBrowse}
    />
  );
}

export function EmptyWishlist({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<Heart size={48} color={Colors.gold.DEFAULT} />}
      title="No Saved Items"
      message="Start adding pieces you love to your wishlist."
      actionLabel="Explore Collection"
      onAction={onBrowse}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<ShoppingBag size={48} color={Colors.gold.DEFAULT} />}
      title="No Orders Yet"
      message="When you place an order, it will appear here."
    />
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle size={48} color={Colors.status.error} />}
      title="Something Went Wrong"
      message="We couldn't load the content. Please try again."
      actionLabel={onRetry ? 'Retry' : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 160,
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 24,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: Colors.gold.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.primary,
  },
});
