/**
 * AuthLayout — shared chrome for Login / Register / Forgot / Reset.
 *
 * A short cinematic photograph band (wordmark over a noir scrim) melts into the themed
 * page, where a left-aligned serif title, a one-line lede and the form sit in a calm
 * single column. Theme-aware below the image, so inputs read correctly in light and
 * dark. Presented as a sheet on iOS (grabber, swipe down to dismiss); on Android it is
 * full-screen with a close button.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { HitSlop, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

const BAND_IMAGE =
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1000&q=80&auto=format&fit=crop';
const IS_SHEET = Platform.OS === 'ios';

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Secondary navigation under the form (e.g. "New here? Create an account"). */
  footer?: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const bandHeight = Math.round(Math.min(Math.max(height * 0.26, 180), 260));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Cinematic band */}
          <View style={[styles.band, { height: bandHeight + (IS_SHEET ? 0 : insets.top) }]}>
            <Image
              source={{ uri: BAND_IMAGE }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={400}
              accessibilityIgnoresInvertColors
            />
            <LinearGradient
              colors={['rgba(11,11,11,0.55)', 'rgba(11,11,11,0.35)', colors.background]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFill}
            />
            {IS_SHEET ? (
              <View style={styles.grabberZone} accessibilityElementsHidden importantForAccessibility="no">
                <View style={styles.grabber} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={HitSlop}
                onPress={close}
                style={({ pressed }) => [styles.close, { top: insets.top + Spacing.sm, opacity: pressed ? 0.6 : 1 }]}
              >
                <X size={18} color={Palette.ivoryText} strokeWidth={1.5} />
              </Pressable>
            )}
            <View style={styles.wordmark} accessibilityRole="header" accessibilityLabel="Al Madina Ittar">
              <Text variant="title" colorValue={Palette.ivoryText} style={styles.wordmarkText}>
                AL MADINA
              </Text>
              <Text variant="overline" colorValue={Palette.champagne} style={styles.wordmarkSub}>
                ITTAR · MAISON DE PARFUM
              </Text>
            </View>
          </View>

          <Animated.View entering={FadeInDown.duration(420)} style={styles.body}>
            <View style={styles.heading}>
              {eyebrow ? (
                <Text variant="overline" color="accent" uppercase>
                  {eyebrow}
                </Text>
              ) : null}
              <Text variant="heading" accessibilityRole="header">
                {title}
              </Text>
              <Text variant="body" color="secondary" style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>

            <View style={styles.form}>{children}</View>

            {footer ? <View style={[styles.footer, { borderTopColor: colors.divider }]}>{footer}</View> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** "Prompt · Link" line used in auth footers. */
export function AuthLink({ prompt, label, onPress }: { prompt?: string; label: string; onPress: () => void }) {
  return (
    <View style={styles.linkRow}>
      {prompt ? (
        <Text variant="body" color="secondary">
          {prompt}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={label}
        hitSlop={HitSlop}
        onPress={onPress}
        style={({ pressed }) => [styles.linkHit, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Text variant="bodyStrong" style={styles.underline}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  band: { justifyContent: 'flex-end', overflow: 'hidden' },
  grabberZone: { position: 'absolute', top: Spacing.sm, left: 0, right: 0, alignItems: 'center' },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(243,238,227,0.6)' },
  close: {
    position: 'absolute',
    right: Layout.screenPadding - Spacing.xs,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,11,11,0.38)',
  },
  wordmark: { position: 'absolute', top: '34%', left: 0, right: 0, alignItems: 'center' },
  wordmarkText: { letterSpacing: 5, fontSize: 18, lineHeight: 22 },
  wordmarkSub: { fontSize: 8, letterSpacing: 2.2, marginTop: 2 },
  body: { paddingHorizontal: Layout.screenPadding, gap: Spacing.xxl, flexGrow: 1 },
  heading: { gap: Spacing.sm },
  subtitle: { maxWidth: 340 },
  form: { gap: Spacing.lg },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.xl, marginTop: 'auto' },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  underline: { textDecorationLine: 'underline' },
});
