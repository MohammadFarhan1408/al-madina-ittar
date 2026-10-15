/**
 * OrderDetailScreen — single order view: line items, shipping address, totals,
 * and live payment status (polls while 'processing', offers retry on 'failed').
 */
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/layout';
import { Badge, Button, Card, Divider, ErrorState, Loader, Text, type BadgeTone } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useOrder, useOrderPayments, useRetryPayment } from '@/hooks/queries';
import { toast } from '@/store';
import type { PaymentStatus } from '@/types';
import { formatPrice, formatVolume, uuid } from '@/utils';
import { OrderTimeline } from './components/OrderTimeline';

const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = {
  pending: 'gold',
  processing: 'gold',
  paid: 'emerald',
  failed: 'error',
  cancelled: 'neutral',
  refunded: 'neutral',
};

export function OrderDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id ?? '');
  const { data: transactions } = useOrderPayments(id ?? '');
  const retryPayment = useRetryPayment(id ?? '');

  if (isError && !order) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="Order" title="Order Details" />
        <ErrorState title="Couldn't load this order" onRetry={() => refetch()} />
      </View>
    );
  }

  if (isLoading || !order) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="Order" title="Order Details" />
        <View style={styles.loader}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline={order.reference} title="Order Details" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OrderTimeline order={order} />
        <Card style={styles.section}>
          <View style={styles.row}>
            <Text variant="bodyStrong">Fulfillment</Text>
            <Badge label={order.status} tone="gold" />
          </View>
          <View style={styles.row}>
            <Text variant="bodyStrong">Payment</Text>
            <Badge label={order.paymentStatus} tone={PAYMENT_TONE[order.paymentStatus]} />
          </View>
          {order.paymentStatus === 'failed' || order.paymentStatus === 'cancelled' ? (
            <Button
              label="Retry Payment"
              variant="outline"
              size="sm"
              loading={retryPayment.isPending}
              onPress={() =>
                retryPayment.mutate(uuid(), {
                  onError: () => toast.error('Retry failed. Please try again.'),
                })
              }
            />
          ) : null}
        </Card>

        <Card style={styles.section}>
          <Text variant="overline" color="muted">
            SHIPPING TO
          </Text>
          <Text variant="bodyStrong">{order.shippingAddress.fullName}</Text>
          <Text variant="caption" color="secondary">
            {order.shippingAddress.address}, {order.shippingAddress.city}
          </Text>
          <Text variant="caption" color="secondary">
            {order.shippingAddress.phone}
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text variant="overline" color="muted">
            ITEMS
          </Text>
          {order.items.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.itemRow}>
              <Image source={{ uri: item.productImage }} style={styles.thumb} contentFit="cover" />
              <View style={styles.itemBody}>
                <Text variant="bodyStrong">{item.productName}</Text>
                <Text variant="caption" color="secondary">
                  Qty {item.quantity}
                  {item.volumeMl ? ` · ${formatVolume(item.volumeMl)}` : ''}
                </Text>
              </View>
              <Text variant="body">{formatPrice(item.price * item.quantity, order.currency)}</Text>
            </View>
          ))}
          <Divider spacing={Spacing.xs} />
          <View style={styles.row}>
            <Text variant="body" color="secondary">
              Subtotal
            </Text>
            <Text variant="body">{formatPrice(order.subtotal, order.currency)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="body" color="secondary">
              Shipping
            </Text>
            <Text variant="body">{order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping, order.currency)}</Text>
          </View>
          {order.discountAmount ? (
            <View style={styles.row}>
              <Text variant="body" color="secondary">
                Discount ({order.couponCode})
              </Text>
              <Text variant="body" color="accent">
                -{formatPrice(order.discountAmount, order.currency)}
              </Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text variant="subtitle">Total</Text>
            <Text variant="priceLarge" color="accent">
              {formatPrice(order.total, order.currency)}
            </Text>
          </View>
        </Card>

        {transactions && transactions.length > 1 ? (
          <Card style={styles.section}>
            <Text variant="overline" color="muted">
              PAYMENT ATTEMPTS
            </Text>
            {transactions.map((txn) => (
              <View key={txn.id} style={styles.row}>
                <Text variant="caption" color="secondary">
                  {new Date(txn.createdAt).toLocaleString()}
                </Text>
                <Badge label={txn.status} tone={txn.status === 'succeeded' ? 'emerald' : txn.status === 'failed' ? 'error' : 'gold'} />
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  section: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  itemBody: { flex: 1, gap: 2 },
  thumb: { width: 44, height: 44, borderRadius: Radius.sm },
});
