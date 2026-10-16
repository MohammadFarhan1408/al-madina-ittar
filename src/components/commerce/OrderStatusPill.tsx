/**
 * OrderStatusPill — a quiet status marker (tone dot + tracked label) shared by the
 * orders list and detail. Tones: in-progress = gold, done = success, problem = error,
 * inert = muted. Colour is never the only signal: the label always names the state.
 */
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { OrderStatus, PaymentStatus } from '@/types';

type Tone = 'progress' | 'done' | 'problem' | 'inert';

const ORDER_TONE: Record<OrderStatus, Tone> = {
  processing: 'progress',
  shipped: 'progress',
  delivered: 'done',
  cancelled: 'problem',
};

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  pending: 'progress',
  processing: 'progress',
  paid: 'done',
  failed: 'problem',
  cancelled: 'inert',
  refunded: 'inert',
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pay on delivery',
  processing: 'Confirming',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function OrderStatusPill(
  props: { kind?: 'order'; status: OrderStatus } | { kind: 'payment'; status: PaymentStatus },
) {
  const { colors } = useTheme();
  const tone = props.kind === 'payment' ? PAYMENT_TONE[props.status] : ORDER_TONE[props.status];
  const label = props.kind === 'payment' ? PAYMENT_LABEL[props.status] : props.status;

  const toneColor: Record<Tone, string> = {
    progress: colors.accent,
    done: colors.success.base,
    problem: colors.error.base,
    inert: colors.text.muted,
  };

  return (
    <View
      style={[styles.pill, { borderColor: colors.border }]}
      accessible
      accessibilityLabel={`${props.kind === 'payment' ? 'Payment' : 'Order'} status: ${label}`}
    >
      <View style={[styles.dot, { backgroundColor: toneColor[tone] }]} />
      <Text variant="overline" color="primary" uppercase style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { letterSpacing: 1.6 },
});
