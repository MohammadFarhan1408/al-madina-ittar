/**
 * OrderCard — order summary row: reference, date, status badge, thumbnails, total.
 */
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Price, Text, type BadgeTone } from '@/components/ui';
import { Radius, Spacing } from '@/constants';
import type { Order, OrderStatus } from '@/types';

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  processing: 'gold',
  shipped: 'emerald',
  delivered: 'emerald',
  cancelled: 'error',
};

export function OrderCard({ order, onPress }: { order: Order; onPress?: (order: Order) => void }) {
  const thumbs = order.items.slice(0, 3);

  return (
    <Card onPress={onPress ? () => onPress(order) : undefined} elevation="sm">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="bodyStrong">{order.reference}</Text>
          <Text variant="caption" color="muted">
            {order.placedAt}
          </Text>
        </View>
        <Badge label={order.status} tone={STATUS_TONE[order.status]} />
      </View>

      <View style={styles.thumbs}>
        {thumbs.map((item) => (
          <Image
            key={item.product.id}
            source={{ uri: item.product.images[0] }}
            style={styles.thumb}
            contentFit="cover"
            transition={200}
          />
        ))}
        <View style={styles.meta}>
          <Text variant="caption" color="secondary">
            {order.summary.itemCount} item{order.summary.itemCount > 1 ? 's' : ''}
          </Text>
          <Price amount={order.summary.total} currency={order.summary.currency} variant="price" showDiscount={false} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { gap: 2 },
  thumbs: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  thumb: { width: 48, height: 48, borderRadius: Radius.sm },
  meta: { flex: 1, alignItems: 'flex-end', gap: 2 },
});
