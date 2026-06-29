/**
 * FloatingHeader — a frosted glass bar that fades in as the user scrolls past the hero,
 * giving persistent access to brand, search and cart once the hero scrolls away.
 */
import { Heart, Search, ShoppingBag } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useHeaderReveal } from '@/animations';
import { LogoMark } from '@/components/brand';
import { GlassSurface, IconButton, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { selectCartCount, selectWishlistCount, useCartStore, useWishlistStore } from '@/store';

export function FloatingHeader({ scrollY }: { scrollY: SharedValue<number> }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const revealStyle = useHeaderReveal(scrollY, 360);
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  return (
    <Animated.View pointerEvents="box-none" style={[styles.host, revealStyle]}>
      <GlassSurface radius={0} intensity={70} bordered={false} style={[styles.bar, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.inner, { borderBottomColor: colors.divider }]}>
          <View style={styles.brand}>
            <LogoMark size={26} />
            <Text variant="subtitle" style={styles.wordmark}>
              AL MADINA
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton onPress={() => router.push('/search')}>
              <Search size={IconSize.sm} color={colors.text.primary} strokeWidth={1.75} />
            </IconButton>
            <IconButton badgeCount={wishlistCount} onPress={() => router.push('/(tabs)/wishlist')}>
              <Heart size={IconSize.sm} color={colors.text.primary} strokeWidth={1.75} />
            </IconButton>
            <IconButton badgeCount={cartCount} onPress={() => router.push('/(tabs)/cart')}>
              <ShoppingBag size={IconSize.sm} color={colors.text.primary} strokeWidth={1.75} />
            </IconButton>
          </View>
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  bar: { width: '100%' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  wordmark: { letterSpacing: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
