/**
 * AboutScreen — brand heritage: hero, story, a timeline of milestones and house values.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Gem, Leaf, Sparkles } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ArtDecoDivider, ArtDecoFrame, LogoMark } from '@/components/brand';
import { StackHeader } from '@/components/layout';
import { Card, Text } from '@/components/ui';
import { IconSize, Layout, Radius, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

const HERO = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=900&q=80&auto=format&fit=crop';

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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Our Heritage" title="About" transparent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          <LinearGradient colors={['rgba(11,11,11,0.4)', 'rgba(11,11,11,0.95)']} style={StyleSheet.absoluteFill} />
          <ArtDecoFrame color={Palette.champagne} inset={Spacing.lg} />
          <View style={styles.heroContent}>
            <LogoMark size={56} color={Palette.champagne} />
            <Text variant="display" colorValue={Palette.ivory} align="center" style={styles.heroTitle}>
              Al Madina
            </Text>
            <Text variant="overline" colorValue={Palette.champagne} align="center">
              MAISON DE PARFUM · EST. 1952
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="body" color="secondary" style={styles.story}>
            For over seventy years, the House of Al Madina has pursued a single obsession: to capture
            the soul of Arabia in a bottle. From the oud forests of the East to the rose gardens of
            Taif, our perfumers travel the ancient spice routes in search of the rarest ingredients —
            then transform them, by hand, into fragrances worthy of royalty.
          </Text>
        </View>

        <ArtDecoDivider label="OUR JOURNEY" style={styles.center} />
        <View style={styles.timeline}>
          {TIMELINE.map((item) => (
            <View key={item.year} style={styles.timelineRow}>
              <Text variant="title" color="accent" style={styles.year}>
                {item.year}
              </Text>
              <View style={[styles.timelineLine, { backgroundColor: colors.divider }]} />
              <Text variant="body" color="secondary" style={styles.timelineLabel}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <ArtDecoDivider label="OUR VALUES" style={styles.center} />
        <View style={styles.values}>
          {VALUES.map((value) => (
            <Card key={value.title} variant="glass" style={styles.valueCard}>
              <value.icon size={IconSize.lg} color={colors.accent} strokeWidth={1.5} />
              <Text variant="bodyStrong" style={styles.valueTitle}>
                {value.title}
              </Text>
              <Text variant="caption" color="secondary">
                {value.body}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: Spacing.giant },
  hero: { height: 360, justifyContent: 'center', alignItems: 'center' },
  heroContent: { alignItems: 'center', gap: Spacing.sm },
  heroTitle: { letterSpacing: 2 },
  section: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl },
  story: { textAlign: 'center' },
  center: { alignSelf: 'center', marginTop: Spacing.xxxl },
  timeline: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xl, gap: Spacing.lg },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  year: { width: 64 },
  timelineLine: { width: 2, alignSelf: 'stretch' },
  timelineLabel: { flex: 1 },
  values: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xl },
  valueCard: { flexGrow: 1, flexBasis: '44%', gap: Spacing.sm, borderRadius: Radius.lg },
  valueTitle: { marginTop: Spacing.xs },
});
