/**
 * OrderCard — order history row: reference + status, placed date, a stacked strip of
 * purchase-time thumbnails (+N), piece count and total, with a chevron affordance.
 */
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import type { Order } from '@/types';
import { formatPrice, formatShortDate } from '@/utils';
import { OrderStatusPill } from './OrderStatusPill';

const MAX_THUMBS = 3;

export function OrderCard({ order, onPress }: { order: Order; onPress?: (order: Order) => void }) {
  const { colors } = useTheme();
  const thumbs = order.items.slice(0, MAX_THUMBS);
  const extra = order.items.length - thumbs.length;
  const pieces = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.reference}, ${order.status}, placed ${formatShortDate(order.placedAt)}, ${pieces} pieces, ${formatPrice(order.total, order.currency)}`}
      accessibilityHint="Opens order details"
      disabled={!onPress}
      onPress={() => onPress?.(order)}
      style={({ pressed }) => [
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="label" uppercase style={styles.ref}>
            {order.reference}
          </Text>
          <Text variant="caption" color="muted">
            Placed {formatShortDate(order.placedAt)}
          </Text>
        </View>
        <OrderStatusPill status={order.status} />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <View style={styles.thumbs}>
          {thumbs.map((item, index) => (
            <View
              key={`${item.productId}-${index}`}
              style={[
                styles.thumb,
                { backgroundColor: colors.imageWell, borderColor: colors.surface, marginLeft: index === 0 ? 0 : -12 },
              ]}
            >
              <Image source={{ uri: item.productImage }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
            </View>
          ))}
          {extra > 0 ? (
            <View style={[styles.thumb, styles.more, { backgroundColor: colors.surfaceElevated, borderColor: colors.surface }]}>
              <Text variant="caption" color="secondary">
                +{extra}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.meta}>
          <Text variant="caption" color="muted">
            {pieces} {pieces === 1 ? 'piece' : 'pieces'}
          </Text>
          <Text variant="price">{formatPrice(order.total, order.currency)}</Text>
        </View>
        {onPress ? <ChevronRight size={16} color={colors.text.muted} strokeWidth={1.5} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.lg, gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  headerText: { gap: 4, flex: 1 },
  ref: { letterSpacing: 1.6 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  thumbs: { flexDirection: 'row', flex: 1 },
  thumb: { width: 44, height: 54, borderRadius: Radius.xs, overflow: 'hidden', borderWidth: 2 },
  more: { alignItems: 'center', justifyContent: 'center', marginLeft: -12 },
  meta: { alignItems: 'flex-end', gap: 2 },
});
