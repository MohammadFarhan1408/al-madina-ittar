/**
 * Modal — centered dialog over a scrim, with spring-scale entrance.
 */
import { type ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
};

export function Modal({ visible, onClose, children, dismissable = true }: ModalProps) {
  const { colors, shadows } = useTheme();

  return (
    <RNModal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissable ? onClose : undefined} />
        </Animated.View>
        <Animated.View
          entering={ZoomIn.springify().damping(18)}
          exiting={ZoomOut.duration(150)}
          style={[styles.card, { backgroundColor: colors.surfaceElevated }, shadows.xl]}
        >
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
  },
});
