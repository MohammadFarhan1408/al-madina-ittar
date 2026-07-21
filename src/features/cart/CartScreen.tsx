/**
 * CartScreen (tab) — line items, a promo field, a glass summary footer and a Checkout CTA.
 * Empty state invites browsing.
 */
import { ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtDecoDivider } from '@/components/brand';
import { OrderSummary } from '@/components/commerce';
import { Button, EmptyState, GlassSurface, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useResponsive } from '@/core/platform';
import { useTheme } from '@/core/theme';
import { useCartStore, useCartSummary } from '@/store';
import { CartLineItem } from './components/CartLineItem';

export function CartScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useResponsive();
  const items = useCartStore((s) => s.items);
  const summary = useCartSummary();

  const maxWidth = Math.min(width, Layout.maxContentWidth);

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Header count={0} top={insets.top} />
        <EmptyState
          icon={<ShoppingBag size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
          title="Your cart is empty"
          message="Discover our signature ittars and add a touch of luxury."
          actionLabel="Start shopping"
          onAction={() => router.push('/(tabs)/shop')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { maxWidth, alignSelf: 'center', width: '100%' }]}
      >
        <Header count={summary.itemCount} top={insets.top} />
        {items.map((item) => (
          <CartLineItem
            key={item.product.id}
            item={item}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product.id } })}
          />
        ))}
      </ScrollView>

      <GlassSurface radius={0} intensity={70} bordered={false} style={[styles.footer, { paddingBottom: insets.bottom + Layout.tabBarClearance - Spacing.xl }]}>
        <View style={[styles.footerInner, { borderTopColor: colors.divider }]}>
          <OrderSummary summary={summary} />
          <Text variant="caption" color="muted" align="center">
            Express delivery, if selected, is added at checkout.
          </Text>
          <Button label="Proceed to Checkout" variant="gradient" glow onPress={() => router.push('/checkout')} />
        </View>
      </GlassSurface>
    </View>
  );
}

function Header({ count, top }: { count: number; top: number }) {
  return (
    <View style={[styles.header, { paddingTop: top + Spacing.lg }]}>
      <Text variant="overline" color="accent" align="center">
        YOUR SELECTION
      </Text>
      <Text variant="display" align="center">
        Shopping Bag
      </Text>
      <ArtDecoDivider label={`${count} ITEM${count === 1 ? '' : 'S'}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Layout.screenPadding, paddingBottom: 280 },
  header: { gap: Spacing.sm, paddingBottom: Spacing.lg, alignItems: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  footerInner: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
