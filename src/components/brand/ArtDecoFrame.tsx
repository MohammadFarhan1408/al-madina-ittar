/**
 * ArtDecoFrame — stepped gold corner border drawn as an absolute overlay. Wrap any
 * container to add a couture frame (hero banners, glass cards, feature blocks).
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';

export type ArtDecoFrameProps = {
  color?: string;
  inset?: number;
  cornerLength?: number;
  style?: ViewStyle;
};

export function ArtDecoFrame({
  color,
  inset = Spacing.md,
  cornerLength = 18,
  style,
}: ArtDecoFrameProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  const c = { borderColor: tint };
  const L = cornerLength;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { margin: inset }, style]}>
      <View style={[styles.corner, styles.tl, c, { width: L, height: L }]} />
      <View style={[styles.corner, styles.tr, c, { width: L, height: L }]} />
      <View style={[styles.corner, styles.bl, c, { width: L, height: L }]} />
      <View style={[styles.corner, styles.br, c, { width: L, height: L }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute', borderRadius: Radius.none, opacity: 0.7 },
  tl: { top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 },
  tr: { top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 },
  br: { bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 },
});
