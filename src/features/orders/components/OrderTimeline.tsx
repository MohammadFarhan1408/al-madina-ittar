/**
 * OrderTimeline — Processing → Shipped → Delivered with the date each step was reached.
 * A cancelled order replaces the steps with a single cancelled notice.
 */
import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Order } from '@/types';
import { formatShortDate } from '@/utils';
import { statusDates, TIMELINE_STEPS } from '../timeline';

const LABEL = { processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' } as const;

export function OrderTimeline({ order }: { order: Order }) {
  const { colors } = useTheme();
  const dates = statusDates(order);

  if (order.status === 'cancelled') {
    return (
      <Card style={styles.card}>
        <Text variant="bodyStrong" color="error">
          This order was cancelled{dates.cancelled ? ` on ${formatShortDate(dates.cancelled)}` : ''}.
        </Text>
      </Card>
    );
  }

  const current = TIMELINE_STEPS.indexOf(order.status as (typeof TIMELINE_STEPS)[number]);

  return (
    <Card style={styles.card}>
      <Text variant="overline" color="muted">
        TRACKING
      </Text>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <View
            key={step}
            style={styles.step}
            accessible
            accessibilityLabel={`${LABEL[step]}, ${done ? `reached ${formatShortDate(dates[step])}` : 'not yet'}`}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { borderColor: done ? colors.accent : colors.border, backgroundColor: done ? colors.accent : 'transparent' },
                ]}
              >
                {done ? <Check size={12} color={colors.text.onAccent} strokeWidth={3} /> : null}
              </View>
              {i < TIMELINE_STEPS.length - 1 ? (
                <View style={[styles.line, { backgroundColor: i < current ? colors.accent : colors.border }]} />
              ) : null}
            </View>
            <View style={styles.body}>
              <Text variant="bodyStrong" color={done ? 'primary' : 'muted'}>
                {LABEL[step]}
              </Text>
              {done && dates[step] ? (
                <Text variant="caption" color="muted">
                  {formatShortDate(dates[step])}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  step: { flexDirection: 'row', gap: Spacing.md, minHeight: 44 },
  rail: { alignItems: 'center', width: 20 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginVertical: 2 },
  body: { flex: 1, paddingBottom: Spacing.sm, gap: 2 },
});
