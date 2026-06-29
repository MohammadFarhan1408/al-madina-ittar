/**
 * OnboardingScreen — a 3-slide paged intro over full-bleed imagery with a luxe scrim.
 * Skip / Next advance; the final slide enters the app. Persists completion via the gate.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArtDecoDivider } from '@/components/brand';
import { Button, DotIndicator, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';

type Slide = { image: string; eyebrow: string; title: string; body: string };

const SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=900&q=80&auto=format&fit=crop',
    eyebrow: 'HERITAGE',
    title: 'The Art of\nArabian Oud',
    body: 'Centuries of perfumery distilled into every precious drop. Discover the soul of the East.',
  },
  {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80&auto=format&fit=crop',
    eyebrow: 'CRAFT',
    title: 'Composed by\nMaster Perfumers',
    body: 'Rare florals, resins and woods, layered by hand for depth, character and longevity.',
  },
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&q=80&auto=format&fit=crop',
    eyebrow: 'YOURS',
    title: 'A Signature\nAll Your Own',
    body: 'Curated collections, delivered to your door. Begin your journey into the Maison.',
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      onDone();
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width }}>
            <Image source={{ uri: slide.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
            <LinearGradient
              colors={['rgba(11,11,11,0.2)', 'rgba(11,11,11,0.7)', 'rgba(11,11,11,0.97)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.slideContent, { paddingBottom: insets.bottom + 220 }]}>
              <Animated.View entering={FadeIn.duration(500)} style={styles.copy}>
                <Text variant="overline" colorValue={Palette.champagne}>
                  {slide.eyebrow}
                </Text>
                <Text variant="hero" colorValue={Palette.ivory} style={styles.title}>
                  {slide.title}
                </Text>
                <ArtDecoDivider color={Palette.champagne} width={120} />
                <Text variant="body" colorValue={Palette.ivoryDim} style={styles.body}>
                  {slide.body}
                </Text>
              </Animated.View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <DotIndicator count={SLIDES.length} activeIndex={index} style={styles.dots} />
        <Button
          label={index === SLIDES.length - 1 ? 'Enter the Maison' : 'Continue'}
          variant="gradient"
          glow
          onPress={goNext}
        />
        <Pressable onPress={onDone} hitSlop={8} style={styles.skip}>
          <Text variant="label" colorValue={Palette.stone} uppercase>
            {index === SLIDES.length - 1 ? ' ' : 'Skip'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  slideContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: Layout.screenPadding },
  copy: { gap: Spacing.md, alignItems: 'flex-start' },
  title: { lineHeight: 52 },
  body: { maxWidth: 320 },
  footer: {
    position: 'absolute',
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    bottom: 0,
    gap: Spacing.lg,
  },
  dots: { alignSelf: 'center' },
  skip: { alignSelf: 'center', paddingVertical: Spacing.xs },
});
