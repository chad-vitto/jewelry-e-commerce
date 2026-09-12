import React, { useCallback, useState } from 'react';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { OrderStatus } from '@/types';
import { ShippingFormModal } from '@/components/admin/ShippingFormModal';
import { useOrderFulfillment } from '@/hooks/useOrderFulfillment';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';


interface FulfillmentActionsProps {
  orderId: string;
  currentStatus: OrderStatus;

  /**
   * Called after a successful fulfillment update.
   * Parent should refetch the order and handle any UI feedback
   * (Toast, Snackbar, Analytics, etc.)
   */
  onStatusChanged?: (status: OrderStatus) => void;

  /**
   * Optional error callback.
   * Parent decides how to present errors.
   */
  onError?: (error: Error) => void;
}

export const FulfillmentActions: React.FC<FulfillmentActionsProps> = ({
  orderId,
  currentStatus,
  onStatusChanged,
  onError,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const {
    loading,
    startProcessing,
    shipOrder,
    markDelivered,
  } = useOrderFulfillment(orderId);

  const [shippingModalVisible, setShippingModalVisible] = useState(false);

  /**
   * Shared executor for all fulfillment actions.
   * Keeps success/error handling consistent.
   */
  const executeAction = useCallback(
    async (
      action: () => Promise<unknown>,
      nextStatus: OrderStatus
    ) => {
      try {
        await action();
        onStatusChanged?.(nextStatus);
      } catch (err) {
        onError?.(
          err instanceof Error
            ? err
            : new Error('An unexpected fulfillment error occurred.')
        );
      }
    },
    [onStatusChanged, onError]
  );

  const renderAction = () => {
  switch (currentStatus) {
    case 'confirmed':
      return (
        <PrimaryButton
          loading={loading}
          title="Start Processing"
          onPress={() =>
            executeAction(startProcessing, 'processing')
          }
        />
      );

    case 'processing':
      return (
        <>
          <PrimaryButton
            loading={loading}
            title="Ship Order"
            onPress={() => setShippingModalVisible(true)}
          />

          <ShippingFormModal
            visible={shippingModalVisible}
            loading={loading}
            onCancel={() => setShippingModalVisible(false)}
            onConfirm={async (carrier, trackingNumber) => {
              await executeAction(
                () =>
                  shipOrder({
                    shippingCarrier: carrier,
                    trackingNumber,
                  }),
                'shipped'
              );

              setShippingModalVisible(false);
            }}
          />
        </>
      );

    case 'shipped':
      return (
        <PrimaryButton
          loading={loading}
          title="Mark Delivered"
          onPress={() =>
            executeAction(markDelivered, 'delivered')
          }
        />
      );

    case 'delivered':
      return (
        <Text style={styles.completedText}>
          ✓ Order Delivered
        </Text>
      );

    default:
      return (
        <Text style={styles.infoText}>
          Fulfillment becomes available after payment verification.
        </Text>
      );
  }
};

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Fulfillment</Text>
      {renderAction()}
    </View>
  );
};

/**
 * Internal reusable button.
 * Keeps renderAction() small and readable.
 */
interface PrimaryButtonProps {
  title: string;
  loading: boolean;
  onPress: () => void;
}

const PrimaryButton = ({
  title,
  loading,
  onPress,
}: PrimaryButtonProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabled]}
      disabled={loading}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text.primary} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
  },

  title: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold.light,
  },

  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.info,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },

  disabled: {
    opacity: 0.6,
  },

  completedText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.success,
  },

  infoText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.text.muted,
  },
});
