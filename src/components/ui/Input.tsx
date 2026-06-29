/**
 * Input — themed text field with label, error and icon slots. Presentational and
 * RHF-ready (drop inside a Controller's render). Use SearchBar for search affordances.
 */
import { forwardRef, type ReactNode } from 'react';
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
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, leftIcon, rightIcon, containerStyle, style, ...rest },
  ref,
) {
  const { colors } = useTheme();
  const borderColor = error ? colors.error.base : colors.border;

  return (
    <View style={containerStyle}>
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
          placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary }, style]}
          {...rest}
        />
        {rightIcon}
      </View>
      {error ? (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
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
    borderRadius: Radius.sm,
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
  },
  error: { marginTop: Spacing.xs },
});
