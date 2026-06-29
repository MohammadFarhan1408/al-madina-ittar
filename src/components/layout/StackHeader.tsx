/**
 * StackHeader — the shared header for non-tab (stack) screens: back chevron, centered
 * serif title with optional overline, and a right-hand action slot. Respects safe-area.
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
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + Spacing.sm,
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
            style={[styles.backBtn, { borderColor: colors.glassBorder }]}
          >
            <ChevronLeft size={IconSize.md} color={colors.text.primary} strokeWidth={1.75} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {overline ? (
          <Text variant="overline" color="accent">
            {overline}
          </Text>
        ) : null}
        {title ? (
          <Text variant="title" align="center" numberOfLines={1}>
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
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  side: { width: 44, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', gap: 2 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
