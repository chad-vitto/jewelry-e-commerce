import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { OrderStatus, PaymentProofStatus } from '@/types';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
} from 'react-native';
import {
  Package,
  CreditCard,
  Clock3,
  Truck,
  CircleCheck,
  XCircle,
  RotateCcw,
} from 'lucide-react-native';

interface OrderTimelineProps {
  orderStatus: OrderStatus;
  paymentStatus: PaymentProofStatus;
  timestamps?: Record<string, string>;
}

type TimelineStep = {
  key: string;
  label: string;
  icon: React.ElementType;
  completed: boolean;
  active: boolean;
  timestampKey?: string;
};

const SPECIAL_TIMELINE_STATES = {
  cancelled: { label: 'Cancelled', icon: XCircle, color: Colors.status.error },
  refunded: { label: 'Refunded', icon: RotateCcw, color: Colors.status.info },
} as const;


function buildTimeline(
  orderStatus: OrderStatus,
  paymentStatus: PaymentProofStatus
): TimelineStep[] {
  const orderPlaced = true;

  const preparing =
    orderStatus === 'processing' ||
    orderStatus === 'shipped' ||
    orderStatus === 'delivered';

  const shipped =
    orderStatus === 'shipped' ||
    orderStatus === 'delivered';

  const delivered =
    orderStatus === 'delivered';

  return [
    {
      key: 'placed',
      label: 'Order Placed',
      icon: Package,
      completed: orderPlaced,
      active: false,
      timestampKey: 'pending',
    },

    {
      key: 'payment',

      label:
        paymentStatus === PaymentProofStatus.Pending
          ? 'Awaiting Payment'
          : paymentStatus === PaymentProofStatus.Submitted
            ? 'Verification in Progress'
            : paymentStatus === PaymentProofStatus.Verified
              ? 'Payment Verified'
              : 'Payment Rejected',

      icon: CreditCard,

      completed:
        paymentStatus === PaymentProofStatus.Verified,

      active:
        paymentStatus === PaymentProofStatus.Pending ||
        paymentStatus === PaymentProofStatus.Submitted ||
        paymentStatus === PaymentProofStatus.Rejected,
      timestampKey: 'confirmed',
    },

    {
      key: 'processing',
      label: 'Preparing Order',
      icon: Clock3,
      completed: preparing,
      active:
        orderStatus === 'processing',
      timestampKey: 'processing',
    },

    {
      key: 'shipped',
      label: 'Shipped',
      icon: Truck,
      completed: shipped,
      active:
        orderStatus === 'shipped',
      timestampKey: 'shipped',
    },

    {
      key: 'delivered',
      label: 'Delivered',
      icon: CircleCheck,
      completed: delivered,
      active:
        orderStatus === 'delivered',
      timestampKey: 'delivered',
    },
  ];
}

function TimelineIcon({
  completed,
  Icon,
  isActive = false,
}: {
  completed: boolean;
  Icon: React.ElementType;
  isActive?: boolean;
}) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isActive, pulseAnim]);

  const backgroundColor = completed
    ? Colors.status.success
    : isActive
      ? Colors.gold.DEFAULT
      : Colors.border.subtle;

  const iconColor = completed || isActive
    ? Colors.surface
    : Colors.text.secondary;

  return (
    <Animated.View
      style={[
        styles.iconCircle,
        {
          backgroundColor,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Icon
        size={10}
        color={iconColor}
      />
    </Animated.View>
  );
}

export function OrderTimeline({ orderStatus, paymentStatus, timestamps = {} }: OrderTimelineProps) {
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [fadeAnim] = useState(() => new Animated.Value(0));


  const showTooltip = (index: number) => {
    setTooltipIndex(index);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideTooltip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setTooltipIndex(null));
  };

  const timeline = buildTimeline(
    orderStatus,
    paymentStatus
  );

  const specialState =
    orderStatus === 'cancelled'
      ? SPECIAL_TIMELINE_STATES.cancelled
      : orderStatus === 'refunded'
        ? SPECIAL_TIMELINE_STATES.refunded
        : null;



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock3 size={18} color={Colors.gold.DEFAULT} />
        <Text style={styles.title}>Order Timeline</Text>
      </View>

      {!specialState &&
        timeline.map((step, index) => {
          const completed = step.completed;
          const Icon = step.icon;
          const isLast = index === timeline.length - 1;
          const isActive = step.active;
          const timestamp =
            step.timestampKey
              ? timestamps[step.timestampKey]
              : undefined;

          const nextStep = timeline[index + 1];
          const connectorCompleted =
            completed || nextStep?.active;

          return (
            <Pressable
              key={step.key}
              onPress={() =>
                tooltipIndex === index ? hideTooltip() : showTooltip(index)
              }
              style={styles.stepRow}
            >
              <View style={styles.iconColumn}>
                <TimelineIcon
                  completed={completed}
                  Icon={Icon}
                  isActive={isActive}
                />
                {!isLast && <View style={[styles.connector, {
                  backgroundColor: connectorCompleted
                    ? Colors.status.success
                    : Colors.border.subtle,
                }]} />}
              </View>
              <View style={styles.labelColumn}>
                <View style={styles.labelRow}>
                  <Icon
                    size={16}
                    color={
                      completed
                        ? Colors.status.success
                        : isActive
                          ? Colors.gold.DEFAULT
                          : Colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.stepLabel,
                      completed
                        ? styles.completedLabel
                        : isActive
                          ? { color: Colors.gold.DEFAULT, fontWeight: '600' }
                          : styles.pendingLabel,
                    ]}
                  >{step.label}
                  </Text>
                </View>

                {tooltipIndex === index && (
                  <Animated.View
                    style={[styles.tooltip, { opacity: fadeAnim }]}
                  >
                    <Text style={styles.tooltipText}>
                      {step.label}
                      {timestamp
                        ? ` • ${formatDistanceToNow(
                          new Date(timestamp),
                          { addSuffix: true }
                        )}`
                        : ''}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </Pressable>
          );
        })}

      {specialState && (
        <View style={styles.stepRow}>
          <View style={styles.iconColumn}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: specialState.color,
                },
              ]}
            >
              {(() => {
                const Icon = specialState.icon;
                return <Icon size={10} color={Colors.surface} />;
              })()}
            </View>
          </View>
          <View style={styles.labelColumn}>
            <View style={styles.labelRow}>
              {(() => {
                const Icon = specialState.icon;
                return (
                  <Icon
                    size={16}
                    color={specialState.color}
                  />
                );
              })()}
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: specialState.color,
                    fontWeight: '600',
                  },
                ]}
              >
                {specialState.label}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 6 },
  iconColumn: { alignItems: 'center', width: 20 },
  iconCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border.subtle,
    marginTop: 2,
    marginBottom: 2,
  },
  labelColumn: { marginLeft: 8, flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  stepLabel: { fontSize: 14 },
  completedLabel: { color: Colors.status.success, fontWeight: '600' },
  pendingLabel: { color: Colors.text.secondary },
  tooltip: {
    backgroundColor: Colors.surfaceLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tooltipText: {
    fontSize: 12,
    color: Colors.text.primary,
  },
});
