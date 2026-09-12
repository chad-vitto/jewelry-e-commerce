import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants';
import { formatDate } from '@/utils/format';
import { Order, OrderStatus } from '@/types';

interface ShippingInfoCardProps {
  order: Order;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    badgeStyle: {
      backgroundColor: string;
      color: string;
    };
  }
> = {
  pending: {
    label: 'Pending',
    badgeStyle: {
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
    },
  },

  confirmed: {
    label: 'Confirmed',
    badgeStyle: {
      backgroundColor: '#E0F2FE',
      color: '#0369A1',
    },
  },

  processing: {
    label: 'Processing',
    badgeStyle: {
      backgroundColor: '#FFF5D6',
      color: '#9A6700',
    },
  },

  shipped: {
    label: 'Shipped',
    badgeStyle: {
      backgroundColor: '#DCEEFF',
      color: '#005FCC',
    },
  },

  delivered: {
    label: 'Delivered',
    badgeStyle: {
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    },
  },

  cancelled: {
    label: 'Cancelled',
    badgeStyle: {
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    },
  },

  refunded: {
    label: 'Refunded',
    badgeStyle: {
      backgroundColor: '#F3E8FF',
      color: '#7E22CE',
    },
  },
};

const SHIPPING_STATUSES: OrderStatus[] = [
  'processing',
  'shipped',
  'delivered',
];

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({
  label,
  value,
}: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

export function ShippingInfoCard({
  order,
}: ShippingInfoCardProps) {
  const {
    order_status,
    shipping_carrier,
    tracking_number,
    shipped_at,
    delivered_at,
  } = order;

  const badge = STATUS_CONFIG[order_status];

  if (!SHIPPING_STATUSES.includes(order_status)) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          Shipping
        </Text>

        <Text style={styles.emptyText}>
          Shipping information will appear once fulfillment begins.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Shipping
        </Text>

        <Text
          style={[
            styles.badge,
            badge.badgeStyle,
          ]}
        >
          {badge.label}
        </Text>
      </View>

      <InfoRow
        label="Carrier"
        value={shipping_carrier ?? 'Not assigned'}
      />

      <InfoRow
        label="Tracking #"
        value={tracking_number ?? 'Not assigned'}
      />

      <InfoRow
        label="Shipped"
        value={
          shipped_at
            ? formatDate(shipped_at)
            : 'Not shipped'
        }
      />

      <InfoRow
        label="Delivered"
        value={
          delivered_at
            ? formatDate(delivered_at)
            : 'Pending'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginTop: 12,
    padding: 16,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.DEFAULT,

    backgroundColor: Colors.surface,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold.light,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 999,

    overflow: 'hidden',

    fontSize: 12,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  emptyText: {
    marginTop: 8,

    fontSize: 14,
    lineHeight: 20,

    color: Colors.text.muted,
  },
});