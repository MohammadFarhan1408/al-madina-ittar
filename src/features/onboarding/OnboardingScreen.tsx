/**
 * OnboardingScreen — a 3-chapter intro over full-bleed photography.
 *
 * Images page horizontally (swipe or Continue); the copy is a single overlay that
 * re-reveals for each chapter, so text never slides with the photo. Thin progress
 * segments and Skip sit at the top; the CTA sits within thumb reach and turns into
 * the gold "Enter the Maison" on the last chapter. Persists completion via `onDone`.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
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
import Animated, { Easing, FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { HitSlop, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { haptics } from '@/utils';

type Slide = { image: string; eyebrow: string; title: string; body: string };

const SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1200&q=80&auto=format&fit=crop',
    eyebrow: 'HERITAGE',
    title: 'The Art of\nArabian Oud',
    body: 'Centuries of perfumery distilled into every precious drop. Discover the soul of the East.',
  },
  {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=80&auto=format&fit=crop',
    eyebrow: 'CRAFT',
    title: 'Composed by\nMaster Perfumers',
    body: 'Rare florals, resins and woods, layered by hand for depth, character and longevity.',
  },
  {
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=80&auto=format&fit=crop',
    eyebrow: 'YOURS',
    title: 'A Signature\nAll Your Own',
    body: 'Curated collections, delivered to your door. Begin your journey into the Maison.',
  },
];

const reveal = (delay: number) => FadeInDown.delay(delay).duration(550).easing(Easing.out(Easing.cubic));

function Segment({ active, done }: { active: boolean; done: boolean }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(active || done ? Palette.ivoryText : 'rgba(243,238,227,0.28)', { duration: 300 }),
  }));
  return <Animated.View style={[styles.segment, style]} />;
}

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) haptics.selection();
    setIndex(next);
  };

  const goNext = () => {
    if (!isLast) {
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
        accessibilityLabel={`Introduction, chapter ${index + 1} of ${SLIDES.length}`}
      >
        {SLIDES.map((s) => (
          <View key={s.title} style={{ width }}>
            <Image source={{ uri: s.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityIgnoresInvertColors />
          </View>
        ))}
      </ScrollView>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(11,11,11,0.6)', 'rgba(11,11,11,0)', 'rgba(11,11,11,0.55)', 'rgba(11,11,11,0.97)']}
        locations={[0, 0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top: progress + skip */}
      <View style={[styles.top, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.segments} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {SLIDES.map((s, i) => (
            <Segment key={s.title} active={i === index} done={i < index} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          onPress={onDone}
          hitSlop={HitSlop}
          style={({ pressed }) => [styles.skip, { opacity: isLast ? 0 : pressed ? 0.5 : 1 }]}
          disabled={isLast}
        >
          <Text variant="label" colorValue={Palette.ivoryText} uppercase>
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Copy — re-reveals per chapter */}
      <View pointerEvents="none" style={[styles.copyHost, { paddingBottom: insets.bottom + 120 }]}>
        <View key={index} style={styles.copy} accessibilityLiveRegion="polite">
          <Animated.View entering={reveal(0)} style={styles.eyebrowRow}>
            <Text variant="overline" colorValue={Palette.champagne}>
              {String(index + 1).padStart(2, '0')} — {slide.eyebrow}
            </Text>
          </Animated.View>
          <Animated.View entering={reveal(90)}>
            <Text variant="hero" colorValue={Palette.ivoryText} style={styles.title} accessibilityRole="header">
              {slide.title}
            </Text>
          </Animated.View>
          <Animated.View entering={reveal(180)}>
            <Text variant="body" colorValue="rgba(243,238,227,0.78)" style={styles.body}>
              {slide.body}
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {isLast ? (
          <Button
            label="Enter the Maison"
            variant="gradient"
            rightIcon={<ArrowRight size={14} color={Palette.ink} strokeWidth={1.75} />}
            onPress={goNext}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            onPress={goNext}
            style={({ pressed }) => [styles.continue, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text variant="button" colorValue={Palette.ink} uppercase>
              Continue
            </Text>
            <ArrowRight size={14} color={Palette.ink} strokeWidth={1.75} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  top: {
    position: 'absolute',
    top: 0,
    left: Layout.screenPadding,
    right: Layout.screenPadding - Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  segments: { flex: 1, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 2, borderRadius: 1 },
  skip: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  copyHost: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Layout.screenPadding },
  copy: { gap: Spacing.md },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  title: { lineHeight: 52 },
  body: { maxWidth: 330 },
  footer: { position: 'absolute', left: Layout.screenPadding, right: Layout.screenPadding, bottom: 0 },
  continue: {
    height: 50,
    borderRadius: 2,
    backgroundColor: Palette.ivoryText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});
