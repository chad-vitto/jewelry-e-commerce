import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants';
import { OrderStatus, PaymentStatus, InquiryStatus } from '@/types';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', size = 'md' }: BadgeProps) {
  const colors = {
    default: { bg: Colors.surfaceLight, text: Colors.text.secondary },
    gold: { bg: Colors.border.gold, text: Colors.gold.DEFAULT },
    success: { bg: 'rgba(76, 175, 80, 0.15)', text: Colors.status.success },
    warning: { bg: 'rgba(255, 193, 7, 0.15)', text: Colors.status.warning },
    error: { bg: 'rgba(244, 67, 54, 0.15)', text: Colors.status.error },
    info: { bg: 'rgba(33, 150, 243, 0.15)', text: Colors.status.info },
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
    md: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  };

  const { bg, text } = colors[variant];
  const { paddingHorizontal, paddingVertical, fontSize } = sizeStyles[size];

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal, paddingVertical }]}>
      <Text style={[styles.text, { color: text, fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

// Order Status Badge
const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const orderStatusVariants: Record<OrderStatus, BadgeProps['variant']> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      label={orderStatusLabels[status]}
      variant={orderStatusVariants[status]}
    />
  );
}

// Payment Status Badge
const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
};

const paymentStatusVariants: Record<PaymentStatus, BadgeProps['variant']> = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      label={paymentStatusLabels[status]}
      variant={paymentStatusVariants[status]}
    />
  );
}

// Inquiry Status Badge
const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
};

const inquiryStatusVariants: Record<InquiryStatus, BadgeProps['variant']> = {
  new: 'error',
  read: 'warning',
  replied: 'success',
};

export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge
      label={inquiryStatusLabels[status]}
      variant={inquiryStatusVariants[status]}
      size="sm"
    />
  );
}

// Gold Purity Badge
export function GoldPurityBadge({ purity }: { purity: string }) {
  return (
    <Badge label={purity} variant="gold" size="sm" />
  );
}

// Stock Badge
export function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <Badge label="Out of Stock" variant="error" size="sm" />;
  }
  if (quantity <= 5) {
    return <Badge label={`Low Stock (${quantity})`} variant="warning" size="sm" />;
  }
  return <Badge label="In Stock" variant="success" size="sm" />;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
