/**
 * StackHeader — the shared header for non-tab (stack) screens: a quiet back control,
 * centered serif title with optional tracked eyebrow, and a right-hand action slot.
 * Solid by default (hairline bottom rule); `transparent` floats it over imagery.
 */
import { ChevronLeft } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HitSlop, IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from '@/components/ui/Text';

export type StackHeaderProps = {
  title?: string;
  overline?: string;
  right?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  transparent?: boolean;
  style?: ViewStyle;
};

export function StackHeader({
  title,
  overline,
  right,
  onBack,
  showBack = true,
  transparent = false,
  style,
}: StackHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + Spacing.xs,
          backgroundColor: transparent ? 'transparent' : colors.background,
          borderBottomColor: transparent ? 'transparent' : colors.divider,
        },
        style,
      ]}
    >
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={HitSlop}
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backBtn,
              transparent && { backgroundColor: 'rgba(11,11,11,0.38)' },
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <ChevronLeft
              size={IconSize.md}
              color={transparent ? '#F3EEE3' : colors.text.primary}
              strokeWidth={1.5}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center} accessibilityRole="header">
        {overline ? (
          <Text variant="overline" color="muted" uppercase numberOfLines={1}>
            {overline}
          </Text>
        ) : null}
        {title ? (
          <Text variant="title" align="center" numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding - Spacing.sm,
    paddingBottom: Spacing.sm,
    minHeight: Layout.headerHeight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  side: { width: 48, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', gap: 1 },
  title: { fontSize: 18, lineHeight: 24 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
