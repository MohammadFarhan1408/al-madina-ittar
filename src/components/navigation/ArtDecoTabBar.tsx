/**
 * ArtDecoTabBar — the floating noir capsule navigation.
 *
 * Design:
 *  - One dark capsule in BOTH themes (it reads as a piece of jewellery over ivory pages
 *    and as a lifted object over black ones). Blurred, hairline edge, soft shadow.
 *  - Inactive tabs are icon-only. The active tab widens into an ivory pill holding its
 *    icon + tracked label in ink. The pill slides AND resizes in one spring, and every
 *    slot animates its width with the same spring, so the pill always lands exactly on
 *    its tab (geometry is computed, not measured — no layout drift or first-frame jump).
 *  - Live cart / wishlist badges; tab semantics + counts for screen readers;
 *    every target ≥ 44 × 52pt.
 * (Name kept for import stability.)
 */
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import {
  Heart,
  Home,
  LayoutGrid,
  ShoppingBag,
  User,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { isWeb } from '@/core/platform';
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

// Geometry
const SIDE_INSET = Spacing.lg; // capsule distance from screen edges
const PAD = 6; // capsule inner padding
const ITEM_H = 52;
const BAR_H = ITEM_H + PAD * 2;
const ACTIVE_MIN = 108; // room for icon + longest label
const ACTIVE_RATIO = 0.34;

// Motion — one spring for pill and slots so they move as a single object.
const SPRING = { damping: 20, stiffness: 220, mass: 0.9 };

// Fixed noir palette (the capsule is dark in both themes).
const BAR_FILL = 'rgba(16, 15, 14, 0.86)';
const BAR_FILL_SOLID = 'rgba(16, 15, 14, 0.97)';
const BAR_EDGE = 'rgba(243, 238, 227, 0.12)';
const ICON_IDLE = 'rgba(243, 238, 227, 0.62)'; // ≈ 7:1 on the capsule
const PILL = Palette.ivoryText;
const PILL_INK = Palette.ink;

/**
 * Total vertical space the floating bar occupies (capsule + its bottom offset). Screens
 * that pin their own footer above the bar (Cart) use this to sit exactly on top of it.
 */
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return BAR_H + Math.max(insets.bottom - Spacing.xs, Spacing.md);
}

function TabItem({
  routeName,
  focused,
  width,
  onPress,
  onLongPress,
  badgeCount,
}: {
  routeName: string;
  focused: boolean;
  width: number;
  onPress: () => void;
  onLongPress: () => void;
  badgeCount?: number;
}) {
  const Icon = ICONS[routeName] ?? Home;
  const label = LABELS[routeName] ?? routeName;
  const showBadge = typeof badgeCount === 'number' && badgeCount > 0;
  const color = focused ? PILL_INK : ICON_IDLE;

  const w = useSharedValue(width);
  useEffect(() => {
    w.value = withSpring(width, SPRING);
  }, [width, w]);
  const slotStyle = useAnimatedStyle(() => ({ width: w.value }));

  return (
    <Animated.View style={slotStyle}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={showBadge ? `${label}, ${badgeCount} items` : label}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.item, { opacity: pressed && !focused ? 0.55 : 1 }]}
      >
        <View>
          <Icon size={20} color={color} strokeWidth={focused ? 1.75 : 1.5} />
          {showBadge ? (
            <View
              style={[
                styles.badge,
                { borderColor: focused ? PILL : BAR_FILL_SOLID },
              ]}
            >
              <Text variant="label" colorValue={Palette.ink} style={styles.badgeText}>
                {badgeCount > 9 ? '9+' : badgeCount}
              </Text>
            </View>
          ) : null}
        </View>
        {focused ? (
          <Animated.View entering={FadeIn.delay(90).duration(200)} exiting={FadeOut.duration(80)}>
            <Text variant="overline" colorValue={PILL_INK} style={styles.label} numberOfLines={1}>
              {label.toUpperCase()}
            </Text>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function ArtDecoTabBar({ state, navigation }: BottomTabBarProps) {
  const { shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  // Computed geometry: inner width shared by one wide active slot + N-1 equal slots.
  const count = state.routes.length;
  const capsuleWidth = Math.min(screenWidth - SIDE_INSET * 2, 520);
  const inner = capsuleWidth - PAD * 2;
  const activeW = Math.max(Math.round(inner * ACTIVE_RATIO), ACTIVE_MIN);
  const idleW = (inner - activeW) / (count - 1);

  // Every slot before the active one is idle, so the pill's x is exact.
  const pillX = useSharedValue(state.index * idleW);
  const pillW = useSharedValue(activeW);
  useEffect(() => {
    pillX.value = withSpring(state.index * idleW, SPRING);
    pillW.value = withSpring(activeW, SPRING);
  }, [state.index, idleW, activeW, pillX, pillW]);
  const pillStyle = useAnimatedStyle(() => ({
    width: pillW.value,
    transform: [{ translateX: pillX.value }],
  }));

  const badgeFor = (routeName: string) =>
    routeName === 'cart' ? cartCount : routeName === 'wishlist' ? wishlistCount : undefined;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: Math.max(insets.bottom - Spacing.xs, Spacing.md) }]}
    >
      <View style={[styles.capsule, { width: capsuleWidth }, shadows.xl]}>
        <View style={styles.clip}>
          {isWeb ? null : <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isWeb ? BAR_FILL_SOLID : BAR_FILL }]} />

          <View accessibilityRole="tablist" style={styles.row}>
            <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
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
              const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
              return (
                <TabItem
                  key={route.key}
                  routeName={route.name}
                  focused={focused}
                  width={focused ? activeW : idleW}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  badgeCount={badgeFor(route.name)}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  capsule: { height: BAR_H, borderRadius: BAR_H / 2 },
  clip: {
    flex: 1,
    borderRadius: BAR_H / 2,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BAR_EDGE,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: PAD - StyleSheet.hairlineWidth },
  pill: {
    position: 'absolute',
    top: PAD - StyleSheet.hairlineWidth,
    left: PAD - StyleSheet.hairlineWidth,
    height: ITEM_H,
    borderRadius: ITEM_H / 2,
    backgroundColor: PILL,
  },
  item: {
    height: ITEM_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  label: { fontSize: 10, lineHeight: 13, letterSpacing: 1.4 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 3,
    backgroundColor: Palette.antiqueGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 8, lineHeight: 10, letterSpacing: 0 },
});
