/**
 * BrandStory — heritage block with imagery, Art Deco frame and a "Discover" link.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ArtDecoDivider, ArtDecoFrame } from '@/components/brand';
import { Button, Text } from '@/components/ui';
import { Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=900&q=80&auto=format&fit=crop';

export function BrandStory() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image source={{ uri: STORY_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        <LinearGradient colors={['rgba(11,11,11,0.55)', 'rgba(11,11,11,0.92)']} style={StyleSheet.absoluteFill} />
        <ArtDecoFrame color={Palette.champagne} inset={Spacing.lg} />
        <View style={styles.content}>
          <Text variant="overline" colorValue={Palette.champagne} align="center">
            OUR HERITAGE
          </Text>
          <Text variant="display" colorValue={Palette.ivory} align="center" style={styles.title}>
            The House of{'\n'}Al Madina
          </Text>
          <ArtDecoDivider color={Palette.champagne} width={120} />
          <Text variant="body" colorValue={Palette.ivoryDim} align="center" style={styles.body}>
            For generations, our master perfumers have travelled the spice routes in pursuit of the
            rarest oud, rose and amber — composing fragrances worthy of royalty.
          </Text>
          <Button label="Discover Our Story" variant="outline" fullWidth={false} onPress={() => router.push('/about')} style={styles.cta} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Layout.screenPadding },
  card: { borderRadius: Radius.xl, overflow: 'hidden', minHeight: 440, justifyContent: 'center' },
  content: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  title: { letterSpacing: 1, lineHeight: 44 },
  body: { maxWidth: 320 },
  cta: { marginTop: Spacing.lg, paddingHorizontal: Spacing.xl },
});
