/**
 * AuthLayout — shared chrome for Login/Register: noir gradient + Art Deco pattern, a
 * close button, brand mark, heading, and a scrollable glass content area.
 */
import { X } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ArtDecoDivider, GradientBackdrop } from '@/components/brand';
import { Text } from '@/components/ui';
import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <GradientBackdrop variant="hero" pattern patternOpacity={0.07} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel="Close"
            hitSlop={HitSlop}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={[styles.close, { borderColor: colors.glassBorder }]}
          >
            <X size={IconSize.sm} color={Palette.ivory} strokeWidth={1.75} />
          </Pressable>

          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo-mark.png')}
              style={{ width: 56, height: 84 }}
              resizeMode="contain"
            />
            <Text variant="display" colorValue={Palette.ivory} align="center" style={styles.title}>
              {title}
            </Text>
            <ArtDecoDivider color={Palette.champagne} width={120} />
            <Text variant="body" colorValue={Palette.ivoryDim} align="center" style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.body}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.richBlack },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Layout.screenPadding, minHeight: '100%' },
  close: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.xxxl },
  title: { letterSpacing: 1 },
  subtitle: { maxWidth: 300 },
  body: { gap: Spacing.lg },
});
