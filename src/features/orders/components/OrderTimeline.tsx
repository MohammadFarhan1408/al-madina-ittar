/**
 * OrderTimeline — Processing → Shipped → Delivered with the date each step was reached.
 * Reached steps fill in ink with a gold tick; the current step wears a soft gold ring.
 * A cancelled order replaces the steps with a single cancelled notice.
 */
import { Check, XCircle } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Order } from '@/types';
import { formatShortDate } from '@/utils';
import { statusDates, TIMELINE_STEPS } from '../timeline';

const LABEL = { processing: 'Order placed · Preparing', shipped: 'Shipped', delivered: 'Delivered' } as const;
const DETAIL = {
  processing: 'Your fragrances are being prepared and packed.',
  shipped: 'On its way to you.',
  delivered: 'Delivered to your address.',
} as const;

export function OrderTimeline({ order }: { order: Order }) {
  const { colors } = useTheme();
  const dates = statusDates(order);

  if (order.status === 'cancelled') {
    return (
      <View style={[styles.cancelled, { backgroundColor: colors.error.soft }]} accessibilityLiveRegion="polite">
        <XCircle size={18} color={colors.error.base} strokeWidth={1.5} />
        <Text variant="body" color="error" style={styles.flex}>
          This order was cancelled{dates.cancelled ? ` on ${formatShortDate(dates.cancelled)}` : ''}.
        </Text>
      </View>
    );
  }

  const current = TIMELINE_STEPS.indexOf(order.status as (typeof TIMELINE_STEPS)[number]);

  return (
    <View>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= current;
        const isCurrent = i === current;
        const last = i === TIMELINE_STEPS.length - 1;
        return (
          <View
            key={step}
            style={styles.step}
            accessible
            accessibilityLabel={`${LABEL[step]}, ${done ? `reached ${formatShortDate(dates[step])}` : 'not yet'}`}
          >
            <View style={styles.rail}>
              <View style={[styles.halo, isCurrent && { borderColor: colors.accent }]}>
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: done ? colors.text.primary : colors.borderStrong,
                      backgroundColor: done ? colors.cta : 'transparent',
                    },
                  ]}
                >
                  {done ? <Check size={11} color={colors.onCta} strokeWidth={2.5} /> : null}
                </View>
              </View>
              {!last ? (
                <View style={[styles.line, { backgroundColor: i < current ? colors.text.primary : colors.border }]} />
              ) : null}
            </View>
            <View style={[styles.body, last && styles.bodyLast]}>
              <View style={styles.titleRow}>
                <Text variant={isCurrent ? 'bodyStrong' : 'body'} color={done ? 'primary' : 'muted'} style={styles.flex}>
                  {LABEL[step]}
                </Text>
                {done && dates[step] ? (
                  <Text variant="caption" color="muted">
                    {formatShortDate(dates[step])}
                  </Text>
                ) : null}
              </View>
              {isCurrent ? (
                <Text variant="caption" color="secondary">
                  {DETAIL[step]}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const HALO = 30;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.sm,
  },
  step: { flexDirection: 'row', gap: Spacing.md },
  rail: { alignItems: 'center', width: HALO },
  halo: {
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  line: { width: StyleSheet.hairlineWidth * 2, flex: 1, minHeight: 24 },
  body: { flex: 1, paddingTop: 5, paddingBottom: Spacing.xl, gap: 4 },
  bodyLast: { paddingBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});
