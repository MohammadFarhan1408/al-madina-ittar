/**
 * OrderSuccess — confirmation shown after an order is placed. Tracks the live
 * payment status (useOrder polls while 'processing') and shows a retry action
 * if the gateway reports 'failed'.
 *
 * Always presented on noir (a moment, like an unboxing): a status seal in a fine gold
 * ring (a slow-spinning ring while payment confirms), the headline in the house face,
 * and an "order card" with the reference, piece count, total and delivery address.
 */
import { AlertTriangle, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { isSettling, useOrder, useRetryPayment } from '@/hooks/queries';
import { toast } from '@/store';
import type { Order } from '@/types';
import { formatPrice, uuid } from '@/utils';

const COPY: Record<string, { title: string; body: string }> = {
  processing: {
    title: 'Confirming Payment',
    body: 'We are confirming your payment now — this only takes a moment.',
  },
  paid: {
    title: 'Order Confirmed',
    body: 'Thank you for your purchase. Your fragrances are being prepared with the utmost care.',
  },
  pending: {
    title: 'Order Confirmed',
    body: 'Thank you for your purchase. Payment is due on delivery.',
  },
  failed: {
    title: 'Payment Failed',
    body: 'Your payment could not be completed. You can retry or contact us for help.',
  },
  cancelled: {
    title: 'Payment Cancelled',
    body: 'Your payment was not completed. You can retry whenever you are ready.',
  },
  refunded: {
    title: 'Order Refunded',
    body: 'This order has been refunded. Contact us if you have any questions.',
  },
};

const STILL_CONFIRMING = {
  title: 'Still Confirming',
  body: 'Your bank is taking a little longer than usual. This page updates as soon as the payment settles.',
};

const IVORY_DIM = 'rgba(243,238,227,0.72)';
const HAIRLINE = 'rgba(243,238,227,0.12)';

export function OrderSuccess({ order: initialOrder, guestEmail }: { order: Order; guestEmail?: string }) {
  const insets = useSafeAreaInsets();
  const { data: order } = useOrder(initialOrder.id, initialOrder, guestEmail);
  const retryPayment = useRetryPayment(initialOrder.id, guestEmail);

  const current = order ?? initialOrder;
  const status = current.paymentStatus;
  const isFailure = status === 'failed' || status === 'cancelled';
  const isProcessing = status === 'processing';
  // Polling stops 2 minutes after placement; if it is still processing then, say so.
  const stalled = isProcessing && !isSettling(current);
  const copy = stalled ? STILL_CONFIRMING : (COPY[status] ?? COPY.paid);
  const pieces = current.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.giant }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.sealWrap}>
          <Seal state={isFailure ? 'failure' : isProcessing ? 'processing' : 'success'} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(520)} style={styles.copy} accessibilityLiveRegion="polite">
          <Text variant="overline" colorValue={Palette.antiqueGold} align="center">
            AL MADINA · THANK YOU
          </Text>
          <Text variant="display" colorValue={Palette.ivoryText} align="center" accessibilityRole="header">
            {copy.title}
          </Text>
          <Text variant="body" colorValue={IVORY_DIM} align="center" style={styles.body}>
            {copy.body}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(520)} style={styles.card}>
          <Row label="Reference" value={initialOrder.reference} strong />
          <Row label="Pieces" value={String(pieces)} />
          <Row label="Total" value={formatPrice(current.total, current.currency)} />
          <View style={styles.divider} />
          <Text variant="overline" colorValue={IVORY_DIM}>
            DELIVERING TO
          </Text>
          <Text variant="body" colorValue={Palette.ivoryText}>
            {current.shippingAddress.fullName}
          </Text>
          <Text variant="caption" colorValue={IVORY_DIM}>
            {current.shippingAddress.address}, {current.shippingAddress.city}
          </Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {isFailure ? (
          <Button
            label="Retry Payment"
            variant="gradient"
            loading={retryPayment.isPending}
            onPress={() =>
              retryPayment.mutate(uuid(), {
                onError: () => toast.error('Retry failed. Please try again.'),
              })
            }
          />
        ) : (
          <Button label="View My Orders" variant="gradient" onPress={() => router.replace('/orders')} />
        )}
        {/* Ivory text link — this screen is always noir, whatever the app theme. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue shopping"
          onPress={() => router.replace('/(tabs)')}
          style={({ pressed }) => [styles.link, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text variant="button" colorValue={Palette.ivoryText} uppercase>
            Continue Shopping
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text variant="caption" colorValue={IVORY_DIM}>
        {label}
      </Text>
      <Text variant={strong ? 'bodyStrong' : 'body'} colorValue={Palette.ivoryText} style={strong && styles.ref}>
        {value}
      </Text>
    </View>
  );
}

/** Status seal: gold ring with a check / alert, or a slowly turning arc while confirming. */
function Seal({ state }: { state: 'success' | 'failure' | 'processing' }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    if (state === 'processing') {
      spin.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1, false);
    } else {
      spin.value = 0;
    }
  }, [state, spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));

  return (
    <View style={styles.seal} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {state === 'processing' ? (
        <Animated.View style={[styles.arc, spinStyle]} />
      ) : (
        <View style={[styles.ring, state === 'failure' && { borderColor: Palette.errorBright }]} />
      )}
      {state === 'success' ? <Check size={30} color={Palette.antiqueGold} strokeWidth={1.25} /> : null}
      {state === 'failure' ? <AlertTriangle size={28} color={Palette.errorBright} strokeWidth={1.25} /> : null}
    </View>
  );
}

const SEAL = 88;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  scroll: { paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.xxl, alignItems: 'center', gap: Spacing.xxl },
  sealWrap: { marginBottom: Spacing.sm },
  seal: { width: SEAL, height: SEAL, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 1,
    borderColor: Palette.antiqueGold,
  },
  arc: {
    position: 'absolute',
    width: SEAL,
    height: SEAL,
    borderRadius: SEAL / 2,
    borderWidth: 1.5,
    borderColor: HAIRLINE,
    borderTopColor: Palette.antiqueGold,
  },
  copy: { alignItems: 'center', gap: Spacing.md },
  body: { maxWidth: 320 },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.xl,
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    backgroundColor: Palette.noir,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 28 },
  ref: { letterSpacing: 1.2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: HAIRLINE, marginVertical: Spacing.sm },
  actions: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.md, gap: Spacing.xs },
  link: { minHeight: 50, alignItems: 'center', justifyContent: 'center' },
});
