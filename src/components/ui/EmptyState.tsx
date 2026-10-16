/**
 * EmptyState — centered, editorial message for empty lists, errors and gated content:
 * a hairline-ringed icon, serif title, quiet body and one action.
 */
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Button, type ButtonVariant } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Visual weight of the action. Defaults to outline. */
  actionVariant?: ButtonVariant;
  style?: ViewStyle;
};

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = 'outline',
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(320)} style={[styles.container, style]}>
      {icon ? (
        <View style={[styles.iconWrap, { borderColor: colors.border }]}>{icon}</View>
      ) : null}
      <Text variant="title" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="secondary" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant={actionVariant}
          fullWidth={false}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.giant,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  message: { maxWidth: 300 },
  action: { marginTop: Spacing.lg, alignSelf: 'center' },
});
