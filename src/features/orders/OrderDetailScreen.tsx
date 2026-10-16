/**
 * OrderDetailScreen — single order view: live status headline + tracking timeline,
 * the purchase-time items, delivery and payment details (status polls while
 * 'processing'; retry on 'failed'/'cancelled'), totals, payment attempts and help.
 *
 * Layout: an editorial status block, then hairline-ruled sections (no boxed cards).
 * States: skeleton while loading, error with retry.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { MessageCircle } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { OrderStatusPill } from '@/components/commerce';
import { StackHeader } from '@/components/layout';
import { Button, Divider, ErrorState, MenuRow, Skeleton, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useOrder, useOrderPayments, useRetryPayment } from '@/hooks/queries';
import { toast } from '@/store';
import type { Order } from '@/types';
import { formatPrice, formatShortDate, formatVolume, uuid } from '@/utils';
import { OrderTimeline } from './components/OrderTimeline';

const HEADLINE: Record<Order['status'], string> = {
  processing: 'Being prepared',
  shipped: 'On its way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const PAYMENT_METHOD = { card: 'Credit / Debit Card', wallet: 'Digital Wallet', cod: 'Cash on Delivery' } as const;
const DELIVERY_METHOD = { standard: 'Standard Delivery', express: 'Express Delivery' } as const;

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
        <View style={[styles.content, { gap: Spacing.lg }]} accessible accessibilityLabel="Loading order">
          <Skeleton width="30%" height={9} />
          <Skeleton width="60%" height={28} />
          <Skeleton width="45%" height={11} />
          <View style={{ height: Spacing.lg }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.skelRow}>
              <Skeleton width={30} height={30} radius={15} />
              <Skeleton width="55%" height={12} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const paymentProblem = order.paymentStatus === 'failed' || order.paymentStatus === 'cancelled';
  const pieces = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Order" title={order.reference} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(300)} style={styles.statusBlock}>
          <View style={styles.statusHead} accessibilityLiveRegion="polite">
            <Text variant="overline" color="accent">
              PLACED {formatShortDate(order.placedAt).toUpperCase()}
            </Text>
            <Text variant="heading" accessibilityRole="header">
              {HEADLINE[order.status]}
            </Text>
          </View>
          <OrderTimeline order={order} />
        </Animated.View>

        {paymentProblem ? (
          <View style={[styles.alert, { backgroundColor: colors.error.soft }]}>
            <Text variant="bodyStrong" color="error">
              Payment {order.paymentStatus === 'failed' ? 'failed' : 'was cancelled'}
            </Text>
            <Text variant="caption" color="secondary">
              Retry to complete payment for this order.
            </Text>
            <Button
              label="Retry Payment"
              loading={retryPayment.isPending}
              onPress={() =>
                retryPayment.mutate(uuid(), {
                  onError: () => toast.error('Retry failed. Please try again.'),
                })
              }
              style={styles.alertBtn}
            />
          </View>
        ) : null}

        <Section title={`${pieces} ${pieces === 1 ? 'Piece' : 'Pieces'}`}>
          {order.items.map((item, index) => (
            <View key={`${item.productId}-${index}`} style={styles.itemRow}>
              <View style={[styles.thumb, { backgroundColor: colors.imageWell }]}>
                <Image source={{ uri: item.productImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
              </View>
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text variant="caption" color="muted">
                  {[item.volumeMl ? formatVolume(item.volumeMl) : null, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text variant="price">{formatPrice(item.price * item.quantity, order.currency)}</Text>
            </View>
          ))}
        </Section>

        <Section title="Delivery">
          <Text variant="bodyStrong">{order.shippingAddress.fullName}</Text>
          <Text variant="body" color="secondary">
            {order.shippingAddress.address}, {order.shippingAddress.city}
          </Text>
          <Text variant="caption" color="muted">
            {order.shippingAddress.phone} · {DELIVERY_METHOD[order.deliveryMethod]}
          </Text>
        </Section>

        <Section title="Payment">
          <View style={styles.row}>
            <Text variant="body">{PAYMENT_METHOD[order.paymentMethod]}</Text>
            <OrderStatusPill kind="payment" status={order.paymentStatus} />
          </View>
          {transactions && transactions.length > 1 ? (
            <View style={styles.attempts}>
              <Text variant="overline" color="muted">
                ATTEMPTS
              </Text>
              {transactions.map((txn) => (
                <View key={txn.id} style={styles.row}>
                  <Text variant="caption" color="secondary">
                    {new Date(txn.createdAt).toLocaleString()}
                  </Text>
                  <Text
                    variant="label"
                    uppercase
                    color={txn.status === 'succeeded' ? 'success' : txn.status === 'failed' ? 'error' : 'secondary'}
                  >
                    {txn.status}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Section>

        <Section title="Summary">
          <SummaryRow label="Subtotal" value={formatPrice(order.subtotal, order.currency)} />
          <SummaryRow
            label="Delivery"
            value={order.shipping === 0 ? 'Complimentary' : formatPrice(order.shipping, order.currency)}
          />
          {order.discountAmount ? (
            <SummaryRow
              label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}
              value={`−${formatPrice(order.discountAmount, order.currency)}`}
              positive
            />
          ) : null}
          <Divider spacing={Spacing.xs} />
          <View style={styles.row}>
            <Text variant="bodyStrong">Total</Text>
            <Text variant="priceLarge">{formatPrice(order.total, order.currency)}</Text>
          </View>
        </Section>

        <View style={[styles.help, { borderTopColor: colors.divider }]}>
          <MenuRow
            icon={<MessageCircle size={18} color={colors.text.secondary} strokeWidth={1.5} />}
            title="Need help with this order?"
            subtitle={`Quote ${order.reference} when you contact us`}
            onPress={() => router.push('/contact')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { borderTopColor: colors.divider }]}>
      <Text variant="overline" color="muted">
        {title.toUpperCase()}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function SummaryRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color="secondary">
        {label}
      </Text>
      <Text variant="body" color={positive ? 'success' : 'primary'}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl, paddingBottom: Spacing.giant },
  skelRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusBlock: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  statusHead: { gap: Spacing.xs },
  alert: { padding: Spacing.lg, borderRadius: Radius.sm, gap: Spacing.xs, marginBottom: Spacing.xxl },
  alertBtn: { marginTop: Spacing.md },
  section: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.xl, gap: Spacing.md },
  sectionBody: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  thumb: { width: 52, height: 64, borderRadius: Radius.xs, overflow: 'hidden' },
  attempts: { gap: Spacing.sm, marginTop: Spacing.sm },
  help: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm },
});
