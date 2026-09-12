// components/customer/CustomerShippingCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { Truck, ExternalLink } from 'lucide-react-native';
import type { OrderStatus } from '@/types';
import { formatDate } from '@/utils/format';

interface CustomerShippingCardProps {
  carrier?: string | null;
  trackingNumber?: string | null;
  status?: OrderStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

/**
 * Utility: Build a tracking URL based on carrier + tracking number.
 * Extend this map with more carriers as needed.
 */
function getTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const normalizedCarrier = carrier.toLowerCase();

  if (normalizedCarrier.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  }
  if (normalizedCarrier.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  }
  if (normalizedCarrier.includes('dhl')) {
    return `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${trackingNumber}`;
  }
  if (normalizedCarrier.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  }
  // Example: LBC (Philippines courier)
  if (normalizedCarrier.includes('lbc')) {
    return `https://www.lbcexpress.com/track/${trackingNumber}`;
  }

  return null;
}

export const CustomerShippingCard: React.FC<CustomerShippingCardProps> = ({
  carrier,
  trackingNumber,
  status,
  shippedAt,
  deliveredAt,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const trackingUrl =
    carrier && trackingNumber ? getTrackingUrl(carrier, trackingNumber) : null;

  const handleTrackPackage = () => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl).catch(() =>
        console.warn('Failed to open tracking URL')
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Truck size={18} color={colors.status.info} />
        <Text style={styles.title}>Shipping</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Carrier</Text>
        <Text style={styles.value}>{carrier ?? '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tracking #</Text>
        <Text style={styles.value}>{trackingNumber ?? '—'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>
          {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
        </Text>
      </View>

      {shippedAt && (
        <View style={styles.row}>
          <Text style={styles.label}>Shipped</Text>
          <Text style={styles.value}>{formatDate(shippedAt)}</Text>
        </View>
      )}

      {deliveredAt && (
        <View style={styles.row}>
          <Text style={styles.label}>Delivered</Text>
          <Text style={styles.value}>{formatDate(deliveredAt)}</Text>
        </View>
      )}

      {trackingUrl && (
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackPackage}>
          <ExternalLink size={16} color={colors.text.primary} />
          <Text style={styles.trackButtonText}>Track Package</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.status.info,
    justifyContent: 'center',
  },
  trackButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
