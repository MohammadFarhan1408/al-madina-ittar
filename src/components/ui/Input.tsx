/**
 * Input — themed text field with label, helper/error and icon slots. Hairline control
 * border that turns gold on focus and error-red on validation failure. Presentational
 * and RHF-ready (drop inside a Controller's render). Use SearchBar for search.
 */
import { forwardRef, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { FontFamily, FontSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Quiet guidance shown under the field when there is no error. */
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, containerStyle, style, onFocus, onBlur, editable, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error.base : focused ? colors.focus : colors.borderStrong;
  const disabled = editable === false;

  return (
    <View style={[containerStyle, disabled ? { opacity: 0.6 } : null]}>
      {label ? (
        <Text variant="label" color="secondary" uppercase style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          rest.multiline ? styles.fieldMultiline : null,
          { borderColor, backgroundColor: colors.surface },
        ]}
      >
        {leftIcon}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.text.muted}
          selectionColor={colors.accent}
          accessibilityLabel={rest.accessibilityLabel ?? label}
          accessibilityHint={error ?? hint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text.primary }, style]}
          {...rest}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text variant="caption" color="error" style={styles.helper} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="muted" style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: Spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  fieldMultiline: {
    height: undefined,
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    paddingVertical: 0,
    alignSelf: 'stretch',
  },
  helper: { marginTop: Spacing.xs },
});
