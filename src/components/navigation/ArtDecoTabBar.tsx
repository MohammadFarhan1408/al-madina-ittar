/**
 * ArtDecoTabBar — a floating frosted-glass tab bar with a gold active indicator (animated
 * diamond), lucide icons, and live cart/wishlist badges. Replaces the default tab bar.
 */
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import {
  Heart,
  Home,
  LayoutGrid,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePressScale } from '@/animations';
import { GlassSurface, Text } from '@/components/ui';
import { IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { selectCartCount, selectWishlistCount, useCartStore, useWishlistStore } from '@/store';
import { haptics } from '@/utils';

const ICONS: Record<string, LucideIcon> = {
  index: Home,
  shop: LayoutGrid,
  wishlist: Heart,
  cart: ShoppingBag,
  profile: User,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  shop: 'Shop',
  wishlist: 'Saved',
  cart: 'Cart',
  profile: 'Profile',
};

function TabItem({
  routeName,
  focused,
  onPress,
  badgeCount,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
  badgeCount?: number;
}) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);
  const Icon = ICONS[routeName] ?? Home;
  const color = focused ? colors.tabBarActive : colors.tabBarInactive;
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={styles.item}
    >
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        {focused ? (
          <Animated.View
            entering={FadeIn.duration(220)}
            style={[styles.indicator, { backgroundColor: colors.accent }]}
          />
        ) : (
          <View style={styles.indicatorPlaceholder} />
        )}
        <View>
          <Icon size={IconSize.md} color={color} strokeWidth={focused ? 2 : 1.75} />
          {showBadge ? (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text variant="label" colorValue={colors.text.onAccent} style={styles.badgeText}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="label" colorValue={color} style={styles.label}>
          {LABELS[routeName] ?? routeName}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function ArtDecoTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  const badgeFor = (routeName: string) =>
    routeName === 'cart' ? cartCount : routeName === 'wishlist' ? wishlistCount : undefined;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md }]}
    >
      <GlassSurface radius={Radius.xxl} intensity={60} style={[styles.bar, shadows.lg]}>
        <View style={[styles.barInner, { backgroundColor: colors.tabBar }]} pointerEvents="box-none">
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                haptics.selection();
                navigation.navigate(route.name);
              }
            };
            return (
              <TabItem
                key={route.key}
                routeName={route.name}
                focused={focused}
                onPress={onPress}
                badgeCount={badgeFor(route.name)}
              />
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 0,
  },
  bar: { overflow: 'hidden' },
  barInner: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  item: { flex: 1 },
  itemInner: { alignItems: 'center', gap: Spacing.xs },
  indicator: { width: 16, height: 3, borderRadius: 2 },
  indicatorPlaceholder: { width: 16, height: 3 },
  label: { letterSpacing: 1 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, letterSpacing: 0 },
});
