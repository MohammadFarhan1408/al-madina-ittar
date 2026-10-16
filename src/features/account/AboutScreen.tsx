/**
 * AboutScreen — brand heritage as an editorial page: a cinematic opener (back control
 * floats over it), the story set as a lede, a hairline timeline of milestones and the
 * house values in a ruled two-up grid. Copy is unchanged.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Gem, Leaf, Sparkles } from 'lucide-react-native';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout';
import { Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

const HERO = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=1200&q=80&auto=format&fit=crop';

const TIMELINE = [
  { year: '1952', label: 'The first Al Madina atelier opens in the old souk.' },
  { year: '1978', label: 'Our signature Royal Oud is composed and sealed by hand.' },
  { year: '2001', label: 'The Maison expands across the Gulf and beyond.' },
  { year: '2026', label: 'Centuries of craft, now in the palm of your hand.' },
];

const VALUES = [
  { icon: Gem, title: 'Rare Materials', body: 'Only the finest oud, rose and amber make our compositions.' },
  { icon: Award, title: 'Master Craft', body: 'Each fragrance is blended and aged by master perfumers.' },
  { icon: Leaf, title: 'Responsibly Sourced', body: 'Ethically harvested ingredients, honouring their origins.' },
  { icon: Sparkles, title: 'Timeless Luxury', body: 'Designed to be treasured for a lifetime and beyond.' },
];

export function AboutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = Math.round(Math.min(Math.max(height * 0.56, 380), 560));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.giant }}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityIgnoresInvertColors />
          <LinearGradient
            colors={['rgba(11,11,11,0.55)', 'rgba(11,11,11,0.25)', 'rgba(11,11,11,0.95)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View entering={FadeInDown.duration(600)} style={styles.heroContent}>
            <Text variant="overline" colorValue={Palette.champagne}>
              MAISON DE PARFUM · EST. 1952
            </Text>
            <Text variant="hero" colorValue={Palette.ivoryText} accessibilityRole="header">
              Al Madina
            </Text>
            <View style={styles.heroRule} />
          </Animated.View>
        </View>

        <View style={styles.section}>
          <Text variant="displayItalic" style={styles.lede}>
            To capture the soul of Arabia in a bottle.
          </Text>
          <Text variant="body" color="secondary" style={styles.story}>
            For over seventy years, the House of Al Madina has pursued a single obsession: to capture
            the soul of Arabia in a bottle. From the oud forests of the East to the rose gardens of
            Taif, our perfumers travel the ancient spice routes in search of the rarest ingredients —
            then transform them, by hand, into fragrances worthy of royalty.
          </Text>
        </View>

        <View style={[styles.section, styles.ruled, { borderTopColor: colors.divider }]}>
          <Text variant="overline" color="accent" accessibilityRole="header">
            OUR JOURNEY
          </Text>
          <View>
            {TIMELINE.map((item, i) => (
              <View key={item.year} style={styles.timelineRow} accessible accessibilityLabel={`${item.year}. ${item.label}`}>
                <Text variant="title" style={styles.year}>
                  {item.year}
                </Text>
                <View style={styles.rail}>
                  <View style={[styles.node, { borderColor: colors.accent, backgroundColor: colors.background }]} />
                  {i < TIMELINE.length - 1 ? <View style={[styles.railLine, { backgroundColor: colors.border }]} /> : null}
                </View>
                <Text variant="body" color="secondary" style={styles.timelineLabel}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.ruled, { borderTopColor: colors.divider }]}>
          <Text variant="overline" color="accent" accessibilityRole="header">
            OUR VALUES
          </Text>
          <View style={[styles.values, { borderColor: colors.border }]}>
            {VALUES.map((value, i) => (
              <View
                key={value.title}
                style={[
                  styles.valueCell,
                  {
                    borderColor: colors.border,
                    borderRightWidth: i % 2 === 0 ? StyleSheet.hairlineWidth : 0,
                    borderBottomWidth: i < 2 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <value.icon size={20} color={colors.accent} strokeWidth={1.25} />
                <Text variant="bodyStrong">{value.title}</Text>
                <Text variant="caption" color="secondary">
                  {value.body}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Back control floats over the opener */}
      <View style={styles.headerHost} pointerEvents="box-none">
        <StackHeader transparent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerHost: { position: 'absolute', top: 0, left: 0, right: 0 },
  hero: { justifyContent: 'flex-end', backgroundColor: Palette.richBlack, overflow: 'hidden' },
  heroContent: { paddingHorizontal: Layout.screenPadding, paddingBottom: Spacing.huge, gap: Spacing.sm },
  heroRule: { width: 32, height: 1, backgroundColor: Palette.antiqueGold, marginTop: Spacing.sm },
  section: { paddingHorizontal: Layout.screenPadding, paddingVertical: Spacing.xxxl, gap: Spacing.xl },
  ruled: { borderTopWidth: StyleSheet.hairlineWidth, marginHorizontal: Layout.screenPadding, paddingHorizontal: 0 },
  lede: { fontSize: 26, lineHeight: 34 },
  story: { lineHeight: 26 },
  timelineRow: { flexDirection: 'row', gap: Spacing.md },
  year: { width: 58, fontSize: 18, lineHeight: 22 },
  rail: { width: 14, alignItems: 'center' },
  node: { width: 9, height: 9, borderRadius: 5, borderWidth: 1, marginTop: 6 },
  railLine: { width: StyleSheet.hairlineWidth * 2, flex: 1, marginVertical: 4 },
  timelineLabel: { flex: 1, paddingBottom: Spacing.xl },
  values: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: StyleSheet.hairlineWidth, borderRadius: 4 },
  valueCell: { width: '50%', padding: Spacing.lg, gap: Spacing.sm },
});
