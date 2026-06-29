/**
 * ToastHost — renders the queued toasts from the UI store as animated banners near the
 * top of the screen. Mounted once in AppProviders. Trigger via the `toast` helper.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react-native';

import { IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useUIStore, type ToastConfig, type ToastVariant } from '@/store';
import { Text } from './Text';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
} as const;

function ToastItem({ toast }: { toast: ToastConfig }) {
  const { colors, shadows } = useTheme();
  const dismiss = useUIStore((s) => s.dismissToast);

  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), toast.duration);
    return () => clearTimeout(id);
  }, [toast.id, toast.duration, dismiss]);

  const accent: Record<ToastVariant, string> = {
    success: colors.success.base,
    error: colors.error.base,
    warning: colors.warning.base,
    info: colors.info.base,
  };
  const Icon = ICONS[toast.variant];

  return (
    <Animated.View entering={FadeInUp.springify().damping(18)} exiting={FadeOutUp.duration(200)}>
      <Pressable
        onPress={() => dismiss(toast.id)}
        style={[
          styles.toast,
          { backgroundColor: colors.surfaceElevated, borderLeftColor: accent[toast.variant] },
          shadows.lg,
        ]}
      >
        <Icon size={IconSize.md} color={accent[toast.variant]} strokeWidth={1.75} />
        <View style={styles.body}>
          {toast.title ? (
            <Text variant="bodyStrong" numberOfLines={1}>
              {toast.title}
            </Text>
          ) : null}
          <Text variant="caption" color="secondary" numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + Spacing.sm }]}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
  },
  body: { flex: 1, gap: 2 },
});
