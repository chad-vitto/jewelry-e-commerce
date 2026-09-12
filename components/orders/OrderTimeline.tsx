import React, { useEffect, useState } from 'react';
import { Colors } from '@/constants';
import { format } from 'date-fns';
import { OrderStatus, PaymentProofStatus } from '@/types';
import {
  StyleSheet,
  Text,
  View,
  Animated,
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
  timestamps?: Partial<Record<string, string>>;
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
  const preparing = ['processing', 'shipped', 'delivered'].includes(orderStatus);

  const shipped = ['shipped', 'delivered'].includes(orderStatus);

  const delivered = orderStatus === 'delivered';

  return [
    {
      key: 'placed',
      label: 'Placed',
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
              ? 'Verified'
              : 'Rejected',

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
      label: 'Preparing',
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
  const [glowAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),

        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isActive, pulseAnim, glowAnim]);

  const borderColor =
    completed || isActive
      ? Colors.gold.DEFAULT
      : Colors.border.subtle;

  const iconColor =
    completed || isActive
      ? Colors.gold.DEFAULT
      : Colors.text.secondary;

  return (
    <Animated.View
      style={[
        styles.iconCircle,
        {
          flexShrink: 0,
          borderColor,

          shadowColor: Colors.gold.DEFAULT,
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.08, 0.22],
          }),
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [3, 6],
          }),
          elevation: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 4],
          }),
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <Icon
          size={22}
          color={iconColor}
        />
      </Animated.View>

      {completed && (
        <View style={styles.checkBadge}>
          <CircleCheck
            size={12}
            color={Colors.surface}
          />
        </View>
      )}
    </Animated.View>
  );
}

export function OrderTimeline({ orderStatus, paymentStatus, timestamps = {
} }: OrderTimelineProps) {

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

      {!specialState && (
        <View style={styles.timelineRow}>
          {timeline.map((step, index) => {
            const Icon = step.icon;
            const completed = step.completed;
            const active = step.active;

            const timestamp = step.timestampKey
              ? timestamps[step.timestampKey]
              : undefined;

            const nextStep = timeline[index + 1];

            const leftConnectorColor =
              completed || active
                ? Colors.gold.DEFAULT
                : Colors.border.subtle;

            const rightConnectorColor =
              nextStep?.completed || nextStep?.active
                ? Colors.gold.DEFAULT
                : Colors.border.subtle;

            return (
              <View
                key={step.key}
                style={styles.timelineItem}
              >
                {/* Icon + Connectors */}
                <View style={styles.iconRow}>

                  {/* Left Connector */}
                  {index !== 0 && (
                    <View
                      style={[
                        styles.connectorLine,
                        { backgroundColor: leftConnectorColor },
                      ]}
                    />
                  )}

                  <TimelineIcon
                    completed={completed}
                    Icon={Icon}
                    isActive={active}
                  />

                  {/* Right Connector */}
                  {index !== timeline.length - 1 && (
                    <View
                      style={[
                        styles.connectorLine,
                        { backgroundColor: rightConnectorColor },
                      ]}
                    />
                  )}

                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                  style={[
                    styles.stepLabel,
                    completed
                      ? styles.completedLabel
                      : active
                        ? styles.activeLabel
                        : styles.pendingLabel,
                  ]}
                >
                  {step.label}
                </Text>

                {timestamp && (
                  <>
                    <Text style={styles.stepDate}>
                      {format(new Date(timestamp), 'MMM d')}
                    </Text>

                    <Text style={styles.stepTime}>
                      {format(new Date(timestamp), 'h:mm a')}
                    </Text>
                  </>
                )}
              </View>
            );
          })}
        </View>
      )}

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
                return <Icon size={20} color={Colors.surface} />;
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
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 18,
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6
  },
  iconColumn: {
    alignItems: 'center',
    width: 20
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,

    borderWidth: 2,
    borderColor: Colors.gold.DEFAULT,

    backgroundColor: Colors.surface,

    justifyContent: 'center',
    alignItems: 'center',

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  checkBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
  },
  labelColumn: {
    marginLeft: 8,
    flex: 1
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  completedLabel: {
    color: Colors.status.success,
    fontWeight: '600'
  },
  pendingLabel: {
    color: Colors.text.secondary
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 42,
  },
  connectorLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 0,
  },
  activeLabel: {
    color: Colors.gold.DEFAULT,
    fontWeight: '700',
  },
  stepDate: {
    marginTop: 6,
    fontSize: 10,
    color: Colors.gold.DEFAULT,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  stepTime: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  stepLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});



