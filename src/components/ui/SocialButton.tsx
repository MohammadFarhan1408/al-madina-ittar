/**
 * SocialButton — outlined icon button for social sign-in options (visual only).
 */
import { type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ControlHeight, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

export type SocialButtonProps = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
};

export function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.btn,
        { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {icon}
      <Text variant="bodyStrong">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    height: ControlHeight.md,
    borderWidth: 1,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
});
