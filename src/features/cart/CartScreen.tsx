/**
 * CartScreen (Bag tab).
 *
 * Header (title + piece count) → complimentary-delivery progress (mirrors the same
 * threshold `computeCartSummary` uses) → line items (stepper, Remove with Undo) → promo
 * code → order summary. A compact checkout panel floats just above the tab bar with the
 * running total and the single gold CTA of the flow.
 *
 * The total here is intentionally NOT final: express delivery is only priced at checkout
 * (see AGENTS.md), so the panel says so.
 */
import { router } from 'expo-router';
import { Heart, ShoppingBag } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderSummary } from '@/components/commerce';
import { useTabBarHeight } from '@/components/navigation';
import { Button, EmptyState, Text } from '@/components/ui';
import { IconSize, Layout, Radius, Spacing } from '@/constants';
import { AppConfig } from '@/core/config';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useAppliedCoupon } from '@/hooks/queries';
import { selectWishlistCount, useCartStore, useCartSummary, useWishlistStore } from '@/store';
import { formatPrice } from '@/utils';
import { CartLineItem } from './components/CartLineItem';
import { CouponField } from './components/CouponField';

const PANEL_HEIGHT = 72;

export function CartScreen() {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const { width } = useResponsive();
  const items = useCartStore((s) => s.items);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const summary = useCartSummary();
  const coupon = useAppliedCoupon(summary.subtotal);

  const maxWidth = Math.min(width, Layout.maxContentWidth);
  const payable = summary.total - coupon.discount;

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Outside the padded scroll content here, so pad the header itself. */}
        <View style={styles.emptyHeader}>
          <Header count={0} top={insets.top} />
        </View>
        <EmptyState
          icon={<ShoppingBag size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
          title="Your bag is empty"
          message="Discover our signature ittars and find the scent that becomes yours."
          actionLabel="Discover the collection"
          actionVariant="primary"
          onAction={() => router.push('/(tabs)/shop')}
          style={{ paddingBottom: tabBarHeight + Spacing.xl }}
        />
        {wishlistCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${wishlistCount} saved pieces`}
            onPress={() => router.push('/(tabs)/wishlist')}
            style={({ pressed }) => [
              styles.savedLink,
              { bottom: tabBarHeight + Spacing.xl, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Heart size={14} color={colors.text.secondary} strokeWidth={1.5} />
            <Text variant="caption" color="secondary">
              You have {wishlistCount} saved {wishlistCount === 1 ? 'piece' : 'pieces'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { maxWidth, paddingBottom: tabBarHeight + PANEL_HEIGHT + Spacing.huge },
        ]}
      >
        <Header count={summary.itemCount} top={insets.top} />
        <DeliveryProgress subtotal={summary.subtotal} currency={summary.currency} />

        <View>
          {items.map((item) => (
            <CartLineItem
              key={item.product.id}
              item={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product.id } })}
            />
          ))}
        </View>

        <View>
          <CouponField subtotal={summary.subtotal} currency={summary.currency} />
        </View>

        <View style={styles.summary}>
          <Text variant="overline" color="muted">
            SUMMARY
          </Text>
          <OrderSummary summary={summary} discount={coupon.discount} />
          <Text variant="caption" color="muted">
            Express delivery, if selected, is added at checkout.
          </Text>
        </View>
      </ScrollView>

      {/* Floating checkout panel, docked just above the tab bar */}
      <View
        style={[
          styles.panel,
          {
            bottom: tabBarHeight + Spacing.sm,
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
          shadows.lg,
        ]}
      >
        <View style={styles.panelTotal} accessible accessibilityLabel={`Total ${formatPrice(payable, summary.currency)}`}>
          <Text variant="overline" color="muted">
            TOTAL
          </Text>
          <Text variant="subtitle" numberOfLines={1}>
            {formatPrice(payable, summary.currency)}
          </Text>
        </View>
        <Button
          label="Checkout"
          variant="gradient"
          onPress={() => router.push('/checkout')}
          style={styles.panelBtn}
        />
      </View>
    </View>
  );
}

function Header({ count, top }: { count: number; top: number }) {
  return (
    <View style={[styles.header, { paddingTop: top + Spacing.xl }]}>
      <Text variant="overline" color="accent">
        {count > 0 ? `${count} ${count === 1 ? 'PIECE' : 'PIECES'}` : 'YOUR SELECTION'}
      </Text>
      <Text variant="display" accessibilityRole="header">
        Bag
      </Text>
    </View>
  );
}

/** Thin progress line toward complimentary delivery (same threshold as the cart summary). */
function DeliveryProgress({ subtotal, currency }: { subtotal: number; currency: string }) {
  const { colors } = useTheme();
  const threshold = AppConfig.freeShippingThreshold;
  const reached = subtotal >= threshold;
  const progress = Math.min(subtotal / threshold, 1);
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: withTiming(progress, { duration: 500 }) }],
  }));

  return (
    <View style={styles.progress} accessible accessibilityLiveRegion="polite">
      <Text variant="caption" color={reached ? 'primary' : 'secondary'}>
        {reached
          ? 'Your order qualifies for complimentary delivery.'
          : `${formatPrice(threshold - subtotal, currency)} away from complimentary delivery`}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Layout.screenPadding, alignSelf: 'center', width: '100%' },
  header: { gap: Spacing.xs, paddingBottom: Spacing.xl },
  emptyHeader: { paddingHorizontal: Layout.screenPadding },
  progress: { gap: Spacing.sm, paddingBottom: Spacing.md },
  track: { height: 2, borderRadius: 1, overflow: 'hidden' },
  fill: { height: 2, width: '100%', transformOrigin: 'left' },
  summary: { marginTop: Spacing.xxl, gap: Spacing.lg },
  savedLink: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  panel: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    height: PANEL_HEIGHT,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingLeft: Spacing.xl,
    paddingRight: (PANEL_HEIGHT - 50) / 2,
  },
  panelTotal: { flex: 1, gap: 2, justifyContent: 'center' },
  panelBtn: { flex: 1.25, alignSelf: 'center' },
});
