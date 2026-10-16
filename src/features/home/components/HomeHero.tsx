/**
 * HomeHero — the cinematic opener. A full-bleed photograph (parallax + slow settle-in
 * zoom) under a bottom-weighted noir scrim, a transparent top bar (wordmark, search,
 * bag), and left-aligned editorial copy in the house face with a single ivory CTA.
 * Height adapts to the device (≈ 78% of the viewport, clamped).
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Search, ShoppingBag } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHeroParallax } from '@/animations';
import { IconButton, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { selectCartCount, useCartStore } from '@/store';
import { haptics } from '@/utils';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=80&auto=format&fit=crop';

export const useHeroHeight = () => {
  const { height } = useWindowDimensions();
  return Math.round(Math.min(Math.max(height * 0.78, 520), 760));
};

const reveal = (delay: number) =>
  FadeInDown.delay(delay).duration(700).easing(Easing.out(Easing.cubic));

export function HomeHero({ scrollY }: { scrollY: SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const heroHeight = useHeroHeight();
  const parallax = useHeroParallax(scrollY, heroHeight);
  const cartCount = useCartStore(selectCartCount);

  // Slow "settle" — the photograph eases from 1.08 to 1 on first paint.
  const settle = useSharedValue(1.08);
  useEffect(() => {
    settle.value = withTiming(1, { duration: 2400, easing: Easing.out(Easing.cubic) });
  }, [settle]);
  const settleStyle = useAnimatedStyle(() => ({ transform: [{ scale: settle.value }] }));

  return (
    <View style={[styles.container, { height: heroHeight }]}>
      <Animated.View style={[StyleSheet.absoluteFill, parallax]}>
        <Animated.View style={[StyleSheet.absoluteFill, settleStyle]}>
          <Image
            source={{ uri: HERO_IMAGE }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={600}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </Animated.View>
      <LinearGradient
        colors={['rgba(11,11,11,0.55)', 'rgba(11,11,11,0)', 'rgba(11,11,11,0.35)', 'rgba(11,11,11,0.97)']}
        locations={[0, 0.22, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Transparent top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.xs }]}>
        <View accessibilityRole="header" accessibilityLabel="Al Madina Ittar">
          <Text variant="title" colorValue={Palette.ivoryText} style={styles.wordmark}>
            AL MADINA
          </Text>
          <Text variant="overline" colorValue={Palette.champagne} style={styles.wordmarkSub}>
            ITTAR · MAISON DE PARFUM
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton accessibilityLabel="Search" onPress={() => router.push('/search')}>
            <Search size={20} color={Palette.ivoryText} strokeWidth={1.5} />
          </IconButton>
          <IconButton
            accessibilityLabel="Shopping bag"
            badgeCount={cartCount}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <ShoppingBag size={20} color={Palette.ivoryText} strokeWidth={1.5} />
          </IconButton>
        </View>
      </View>

      {/* Editorial copy */}
      <View style={styles.copy}>
        <Animated.View entering={reveal(150)} style={styles.eyebrowRow}>
          <View style={styles.eyebrowRule} />
          <Text variant="overline" colorValue={Palette.champagne}>
            SIGNATURE COLLECTION
          </Text>
        </Animated.View>
        <Animated.View entering={reveal(280)}>
          <Text variant="hero" colorValue={Palette.ivoryText} style={styles.title} accessibilityRole="header">
            The Royal Oud
          </Text>
        </Animated.View>
        <Animated.View entering={reveal(400)}>
          <Text variant="body" colorValue="rgba(243,238,227,0.78)" style={styles.subtitle}>
            Aged oud, saffron and Taif rose — an opulent signature for those who command presence.
          </Text>
        </Animated.View>
        <Animated.View entering={reveal(520)} style={styles.ctaRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Explore the collection"
            onPress={() => {
              haptics.light();
              router.push('/products');
            }}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text variant="button" colorValue={Palette.ink} uppercase>
              Explore the Collection
            </Text>
            <ArrowRight size={14} color={Palette.ink} strokeWidth={1.75} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'flex-end', overflow: 'hidden', backgroundColor: Palette.richBlack },
  topBar: {
    position: 'absolute',
    top: 0,
    left: Layout.screenPadding,
    right: Layout.screenPadding - Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: { letterSpacing: 4, fontSize: 18, lineHeight: 22 },
  wordmarkSub: { fontSize: 8, letterSpacing: 2.2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  copy: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.giant,
    gap: Spacing.lg,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  eyebrowRule: { width: 28, height: 1, backgroundColor: Palette.antiqueGold },
  title: { maxWidth: 340 },
  subtitle: { maxWidth: 320 },
  ctaRow: { flexDirection: 'row', marginTop: Spacing.sm },
  cta: {
    height: 52,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.xs,
    backgroundColor: Palette.ivoryText,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
