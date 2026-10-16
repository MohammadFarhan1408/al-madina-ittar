/**
 * SegmentedControl — a hairline track with a sliding ink thumb (spring), for small
 * exclusive choices like Light / Dark / System. Announced as a radio group.
 */
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { spring } from '@/animations';
import { Radius } from '@/constants';
import { useTheme } from '@/core/theme';
import { haptics } from '@/utils';
import { Text } from './Text';

export type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

const PAD = 3;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segment = width > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(index * segment, spring.soft);
  }, [index, segment, x]);

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}
    >
      {segment > 0 ? (
        <Animated.View style={[styles.thumb, { width: segment, backgroundColor: colors.cta }, thumbStyle]} />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (!selected) {
                haptics.selection();
                onChange(option.value);
              }
            }}
            style={styles.segment}
          >
            <Text variant="label" uppercase colorValue={selected ? colors.onCta : colors.text.secondary}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: PAD,
    borderRadius: Radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: Radius.xs },
  segment: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' },
});
