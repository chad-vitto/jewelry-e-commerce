import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { OrderStatus, PaymentProofStatus } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { StyleSheet, Text, View, Animated, } from 'react-native';
import { Package, CreditCard, Clock3, Truck, CircleCheck, Check, RotateCcw, } from 'lucide-react-native';

interface OrderTimelineProps {
  orderStatus: OrderStatus;
  paymentStatus: PaymentProofStatus;
  orderPaymentStatus?: string;
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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
      ? colors.gold.DEFAULT
      : colors.border.subtle;

  const iconColor =
    completed || isActive
      ? colors.gold.DEFAULT
      : colors.text.secondary;

  return (
    <Animated.View
      style={[
        styles.iconCircle,
        {
          flexShrink: 0,
          borderColor,

          shadowColor: colors.gold.DEFAULT,
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
            color={colors.surface}
          />
        </View>
      )}
    </Animated.View>
  );
}

export function OrderTimeline({ orderStatus, paymentStatus, orderPaymentStatus, timestamps = {
} }: OrderTimelineProps) {

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const timeline = buildTimeline(
    orderStatus,
    paymentStatus
  );

  const isRefunded =
    orderStatus === 'cancelled' &&
    orderPaymentStatus === 'refunded';

  const specialState =
    orderStatus === 'cancelled'
      ? {
        label: 'Cancellation Completed',
        color: colors.status.error,
      }
      : null;

  const specialTimestamp = specialState
    ? timestamps.pending
    : undefined;

  const refundTimestamp = isRefunded
    ? timestamps.refunded
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock3 size={18} color={colors.gold.DEFAULT} />
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
                ? colors.gold.DEFAULT
                : colors.border.subtle;

            const rightConnectorColor =
              nextStep?.completed || nextStep?.active
                ? colors.gold.DEFAULT
                : colors.border.subtle;

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
        <View style={styles.specialStateRow}>
          <View style={styles.specialStateContent}>
            {/* Cancellation */}
            <View style={styles.specialTimelineItem}>
              <View
                style={[
                  styles.specialTimelineDot,
                  {
                    backgroundColor: `${specialState.color}18`,
                    borderColor: specialState.color,
                  },
                ]}
              >
                <Check
                  size={15}
                  color={specialState.color}
                  strokeWidth={2.2}
                />
              </View>

              <View style={styles.specialTimelineText}>
                <Text
                  style={[
                    styles.specialStateLabel,
                    { color: specialState.color },
                  ]}
                >
                  Cancellation Completed
                </Text>

                {specialTimestamp && (
                  <Text style={styles.specialStateTimestamp}>
                    on {format(new Date(specialTimestamp), 'dd-MM-yyyy HH:mm')}.
                  </Text>
                )}
              </View>
            </View>

            {/* Refund */}
            {isRefunded && (
              <>
                <View
                  style={[
                    styles.specialTimelineConnector,
                    {
                      backgroundColor: colors.status.error,
                    },
                  ]}
                />

                <View style={styles.specialTimelineItem}>
                  <View
                    style={[
                      styles.specialTimelineDot,
                      styles.refundTimelineDot,
                      {
                        backgroundColor: `${colors.status.info}18`,
                        borderColor: colors.status.info,
                      },
                    ]}
                  >
                    <RotateCcw
                      size={15}
                      color={colors.status.info}
                      strokeWidth={2.2}
                    />
                  </View>

                  <View style={styles.specialTimelineText}>
                    <Text
                      style={[
                        styles.specialStateLabel,
                        styles.refundStateLabel,
                      ]}
                    >
                      Refund Completed
                    </Text>

                    {refundTimestamp && (
                      <Text style={styles.specialStateTimestamp}>
                        on {format(new Date(refundTimestamp), 'dd-MM-yyyy HH:mm')}.
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Final completion indicator */}
          <View style={styles.iconColumn}>
            <View
              style={[
                styles.iconCircle,
                styles.specialStateIcon,
                {
                  backgroundColor: `${isRefunded
                    ? colors.status.info
                    : specialState.color}18`,
                  borderColor: isRefunded
                    ? colors.status.info
                    : specialState.color,
                },
              ]}
            >
              <Check
                size={22}
                color={
                  isRefunded
                    ? colors.status.info
                    : specialState.color
                }
                strokeWidth={1.8}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
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
    color: colors.text.primary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  iconColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,

    borderWidth: 2,
    borderColor: colors.gold.DEFAULT,

    backgroundColor: colors.surface,

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
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceLight,
  },
  labelColumn: {
    marginLeft: 12,
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  completedLabel: {
    color: colors.status.success,
    fontWeight: '600'
  },
  pendingLabel: {
    color: colors.text.secondary
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
    color: colors.gold.DEFAULT,
    fontWeight: '700',
  },
  stepDate: {
    marginTop: 6,
    fontSize: 10,
    color: colors.gold.DEFAULT,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  stepTime: {
    fontSize: 10,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  stepLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  specialStateLabel: {
    textAlign: 'left',
    fontSize: 17,
    fontWeight: '600',
  },
  specialStateIcon: {
    borderWidth: 1.5,
  },
  specialStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specialStateContent: {
    flex: 1,
    paddingRight: 16,
  },
  specialTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  specialTimelineText: {
    flex: 1,
    marginLeft: 10,
  },

  specialTimelineDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  refundTimelineDot: {
    opacity: 0.95,
  },

  refundStateLabel: {
    color: colors.status.info,
  },

  specialTimelineConnector: {
    width: 2,
    height: 18,
    marginLeft: 14,
    marginVertical: 2,
    opacity: 0.65,
  },
  specialStateTimestamp: {
    marginTop: 6,
    color: colors.text.secondary,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
});



