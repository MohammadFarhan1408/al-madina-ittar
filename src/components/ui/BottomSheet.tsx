/**
 * BottomSheet — gesture-driven sheet that slides up over a backdrop and can be swiped
 * down to dismiss. Controlled via `visible` / `onClose`.
 */
import { useEffect, type ReactNode } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spring } from '@/animations';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Fraction of screen height the sheet may occupy (0–1). */
  maxHeightRatio?: number;
};

const CLOSE_THRESHOLD = 120;

export function BottomSheet({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.85,
}: BottomSheetProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);

  useEffect(() => {
    translateY.value = visible ? withSpring(0, spring.soft) : withTiming(height);
  }, [visible, height, translateY]);

  const close = () => {
    translateY.value = withTiming(height, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > 800) {
        runOnJS(close)();
      } else {
        translateY.value = withSpring(0, spring.soft);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height], [1, 0]),
  }));

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }, backdropStyle]}>
          <Animated.View style={StyleSheet.absoluteFill} onTouchEnd={close} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceElevated,
                maxHeight: height * maxHeightRatio,
                paddingBottom: insets.bottom + Spacing.lg,
              },
              shadows.xl,
              sheetStyle,
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
});
