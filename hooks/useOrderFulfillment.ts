import { useState, useCallback } from 'react';
import type { Order } from '@/types';
import {
  startProcessing as svcStartProcessing,
  shipOrder as svcShipOrder,
  markDelivered as svcMarkDelivered,
} from '@/services/orderFulfillmentService';

export interface ShipOrderParams {
  trackingNumber?: string | null;
  shippingCarrier?: string | null;
}

export interface OrderFulfillmentAPI {
  loading: boolean;
  error: string | null;

  startProcessing: () => Promise<Order | null>;
  shipOrder: (params?: ShipOrderParams) => Promise<Order | null>;
  markDelivered: () => Promise<Order | null>;
}

/**
 * useOrderFulfillment
 *
 * Business logic layer for the Admin Fulfillment Workflow.
 *
 * Responsibilities
 * ----------------
 * • Moves an already paid order through the fulfillment lifecycle.
 * • Owns loading and error state.
 * • Delegates all database operations to orderFulfillmentService.
 *
 * Does NOT
 * --------
 * • Fetch orders
 * • Refresh queries
 * • Render UI
 * • Navigate
 * • Show alerts/snackbars
 */
export function useOrderFulfillment(
  orderId: string | null
): OrderFulfillmentAPI {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ensures a valid order ID exists before executing
   * any fulfillment action.
   */
  const ensureOrderId = useCallback((): string => {
    if (!orderId) {
      const message = 'Missing orderId';
      setError(message);
      throw new Error(message);
    }

    return orderId;
  }, [orderId]);

  /**
   * Shared executor for all fulfillment actions.
   * Handles loading and error state consistently.
   */
  const execute = useCallback(
    async (
      action: (orderId: string) => Promise<Order | null>,
      fallbackMessage: string
    ): Promise<Order | null> => {
      const id = ensureOrderId();

      setLoading(true);
      setError(null);

      try {
        return await action(id);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : fallbackMessage;

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [ensureOrderId]
  );

  const startProcessing = useCallback(() => {
    return execute(
      svcStartProcessing,
      'Failed to start processing'
    );
  }, [execute]);


  const shipOrder = useCallback(
    (params: ShipOrderParams = {}) => {
      return execute(
        (id) =>
          svcShipOrder(id, {
            trackingNumber: params.trackingNumber ?? null,
            shippingCarrier: params.shippingCarrier ?? null,
          }),
        'Failed to ship order'
      );
    },
    [execute]
  );

  const markDelivered = useCallback(() => {
    return execute(
      svcMarkDelivered,
      'Failed to mark delivered'
    );
  }, [execute]);

  return {
    loading,
    error,
    startProcessing,
    shipOrder,
    markDelivered,
  };
}