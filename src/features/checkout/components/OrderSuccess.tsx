/**
 * OrderSuccess — confirmation shown after an order is placed. Tracks the live
 * payment status (useOrder polls while 'processing') and shows a retry action
 * if the (simulated) gateway reports 'failed'.
 */
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtDecoDivider, FloatingMotif, GradientBackdrop } from '@/components/brand';
import { Button, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useOrder, useRetryPayment } from '@/hooks/queries';
import { toast } from '@/store';
import type { Order } from '@/types';
import { uuid } from '@/utils';

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
};

export function OrderSuccess({ order: initialOrder }: { order: Order }) {
  const insets = useSafeAreaInsets();
  const { data: order } = useOrder(initialOrder.id, initialOrder);
  const retryPayment = useRetryPayment(initialOrder.id);

  const status = order?.paymentStatus ?? initialOrder.paymentStatus;
  const isFailure = status === 'failed' || status === 'cancelled';
  const copy = COPY[status] ?? COPY.paid;

  return (
    <View style={styles.root}>
      <GradientBackdrop variant="hero" pattern patternOpacity={0.08} />
      <FloatingMotif size={90} color={Palette.champagne} opacity={0.3} style={[styles.motif, { top: insets.top + 40 }]} />
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          {status === 'processing' ? (
            <Loader2 size={IconSize.xxl + 24} color={Palette.gold} strokeWidth={1.5} />
          ) : isFailure ? (
            <AlertTriangle size={IconSize.xxl + 24} color={Palette.gold} strokeWidth={1.5} />
          ) : (
            <CheckCircle2 size={IconSize.xxl + 24} color={Palette.gold} strokeWidth={1.5} />
          )}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.copy}>
          <Text variant="display" colorValue={Palette.ivory} align="center">
            {copy.title}
          </Text>
          <ArtDecoDivider color={Palette.champagne} width={140} />
          <Text variant="body" colorValue={Palette.ivoryDim} align="center" style={styles.body}>
            {copy.body}
          </Text>
          <Text variant="overline" colorValue={Palette.champagne} align="center">
            REFERENCE {initialOrder.reference}
          </Text>
        </Animated.View>
      </View>
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {isFailure ? (
          <Button
            label="Retry Payment"
            variant="gradient"
            glow
            loading={retryPayment.isPending}
            onPress={() =>
              retryPayment.mutate(uuid(), {
                onError: () => toast.error('Retry failed. Please try again.'),
              })
            }
          />
        ) : (
          <Button label="View My Orders" variant="gradient" glow onPress={() => router.replace('/orders')} />
        )}
        <Button label="Continue Shopping" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  motif: { position: 'absolute', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Layout.screenPadding, gap: Spacing.xl },
  copy: { alignItems: 'center', gap: Spacing.md },
  body: { maxWidth: 320 },
  actions: { paddingHorizontal: Layout.screenPadding, gap: Spacing.sm },
});
