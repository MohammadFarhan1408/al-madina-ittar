/**
 * ErrorState — recoverable error with a Retry action. Pair with EmptyState (no data)
 * and Skeleton (loading) so every data screen has all three states.
 */
import { CloudOff } from 'lucide-react-native';
import { StyleSheet, type ViewStyle } from 'react-native';

import { IconSize } from '@/constants';
import { useTheme } from '@/core/theme';
import { EmptyState } from './EmptyState';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
};

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this. Check your connection and try again.",
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <EmptyState
      style={StyleSheet.flatten([style])}
      icon={<CloudOff size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
      title={title}
      message={message}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
    />
  );
}
