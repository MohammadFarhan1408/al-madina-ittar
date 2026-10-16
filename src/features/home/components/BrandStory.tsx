/**
 * BrandStory — a full-bleed heritage chapter: photograph under a deep scrim, centered
 * statement in the house face, a short story and an underlined link to About.
 * Always rendered on dark (it sits on photography), whatever the theme.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { haptics } from '@/utils';

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1200&q=80&auto=format&fit=crop';

export function BrandStory() {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: STORY_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={400}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(11,11,11,0.7)', 'rgba(11,11,11,0.55)', 'rgba(11,11,11,0.92)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text variant="overline" colorValue={Palette.champagne} align="center">
          OUR HERITAGE
        </Text>
        <Text variant="display" colorValue={Palette.ivoryText} align="center" accessibilityRole="header">
          The House of{'\n'}Al Madina
        </Text>
        <View style={styles.rule} />
        <Text variant="body" colorValue="rgba(243,238,227,0.8)" align="center" style={styles.body}>
          For generations our perfumers have travelled the spice routes in pursuit of the rarest oud,
          rose and amber — composing fragrances worthy of royalty.
        </Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Discover our story"
          onPress={() => {
            haptics.light();
            router.push('/about');
          }}
          style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text variant="button" colorValue={Palette.ivoryText} uppercase>
            Discover our story
          </Text>
          <ArrowRight size={14} color={Palette.ivoryText} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 520, justifyContent: 'center', backgroundColor: Palette.richBlack, overflow: 'hidden' },
  content: {
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding + Spacing.lg,
    paddingVertical: Spacing.giant,
    gap: Spacing.lg,
  },
  rule: { width: 32, height: 1, backgroundColor: Palette.antiqueGold },
  body: { maxWidth: 330 },
  link: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Palette.antiqueGold,
    minHeight: 44,
  },
});
