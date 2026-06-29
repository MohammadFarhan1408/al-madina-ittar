/**
 * HomeHero — full-bleed parallax hero with a transparent top bar (logo + search + cart/
 * wishlist), brand eyebrow, display title and primary CTA. Driven by the page scrollY.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Search, ShoppingBag } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useHeroParallax } from '@/animations';
import { ArtDecoDivider, FloatingMotif, LogoMark } from '@/components/brand';
import { Button, IconButton, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { selectCartCount, selectWishlistCount, useCartStore, useWishlistStore } from '@/store';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1000&q=80&auto=format&fit=crop';
const HERO_HEIGHT = 540;

export function HomeHero({ scrollY }: { scrollY: SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const parallax = useHeroParallax(scrollY, HERO_HEIGHT);
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore(selectWishlistCount);

  return (
    <View style={[styles.container, { height: HERO_HEIGHT }]}>
      <Animated.View style={[StyleSheet.absoluteFill, parallax]}>
        <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
      </Animated.View>
      <LinearGradient
        colors={['rgba(11,11,11,0.35)', 'rgba(11,11,11,0.55)', 'rgba(11,11,11,0.98)']}
        style={StyleSheet.absoluteFill}
      />
      <FloatingMotif size={70} color={Palette.champagne} opacity={0.35} style={[styles.motif, { top: insets.top + 80 }]} />

      {/* Transparent top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.brand}>
          <LogoMark size={32} color={Palette.champagne} />
          <View>
            <Text variant="subtitle" colorValue={Palette.ivory} style={styles.wordmark}>
              AL MADINA
            </Text>
            <Text variant="overline" colorValue={Palette.champagne}>
              MAISON DE PARFUM
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <IconButton onPress={() => router.push('/search')}>
            <Search size={IconSize.md} color={Palette.ivory} strokeWidth={1.75} />
          </IconButton>
          <IconButton badgeCount={wishlistCount} onPress={() => router.push('/(tabs)/wishlist')}>
            <Heart size={IconSize.md} color={Palette.ivory} strokeWidth={1.75} />
          </IconButton>
          <IconButton badgeCount={cartCount} onPress={() => router.push('/(tabs)/cart')}>
            <ShoppingBag size={IconSize.md} color={Palette.ivory} strokeWidth={1.75} />
          </IconButton>
        </View>
      </View>

      {/* Hero copy */}
      <View style={styles.copy}>
        <Text variant="overline" colorValue={Palette.champagne} align="center">
          SIGNATURE COLLECTION
        </Text>
        <Text variant="hero" colorValue={Palette.ivory} align="center" style={styles.title}>
          The Royal Oud
        </Text>
        <ArtDecoDivider color={Palette.champagne} width={150} />
        <Text variant="body" colorValue={Palette.ivoryDim} align="center" style={styles.subtitle}>
          An opulent symphony of aged oud, saffron and Taif rose — for those who command presence.
        </Text>
        <Button
          label="Explore the Collection"
          variant="gradient"
          glow
          fullWidth={false}
          onPress={() => router.push('/products')}
          style={styles.cta}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'flex-end', overflow: 'hidden' },
  motif: { position: 'absolute', right: Spacing.xl },
  topBar: {
    position: 'absolute',
    top: 0,
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  wordmark: { letterSpacing: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  copy: { alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.huge, gap: Spacing.md },
  title: { letterSpacing: 1 },
  subtitle: { maxWidth: 320 },
  cta: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xxl },
});
