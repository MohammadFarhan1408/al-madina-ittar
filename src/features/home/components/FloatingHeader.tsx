/**
 * FloatingHeader — a frosted bar that fades in once the hero scrolls away, keeping the
 * wordmark, search and bag within reach. Mirrors the hero's top bar exactly so the
 * hand-off reads as one continuous header.
 */
import { Search, ShoppingBag } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useHeaderReveal } from '@/animations';
import { GlassSurface, IconButton, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { selectCartCount, useCartStore } from '@/store';

export function FloatingHeader({ scrollY, threshold }: { scrollY: SharedValue<number>; threshold: number }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const revealStyle = useHeaderReveal(scrollY, threshold);
  const cartCount = useCartStore(selectCartCount);

  return (
    <Animated.View pointerEvents="box-none" style={[styles.host, revealStyle]}>
      <GlassSurface radius={0} intensity={80} bordered={false}>
        <View
          style={[
            styles.inner,
            { paddingTop: insets.top + Spacing.xs, backgroundColor: colors.tabBar, borderBottomColor: colors.divider },
          ]}
        >
          <Text variant="title" style={styles.wordmark} accessibilityRole="header">
            AL MADINA
          </Text>
          <View style={styles.actions}>
            <IconButton accessibilityLabel="Search" onPress={() => router.push('/search')}>
              <Search size={20} color={colors.text.primary} strokeWidth={1.5} />
            </IconButton>
            <IconButton accessibilityLabel="Shopping bag" badgeCount={cartCount} onPress={() => router.push('/(tabs)/cart')}>
              <ShoppingBag size={20} color={colors.text.primary} strokeWidth={1.5} />
            </IconButton>
          </View>
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Layout.screenPadding,
    paddingRight: Layout.screenPadding - Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { letterSpacing: 4, fontSize: 16, lineHeight: 20 },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
