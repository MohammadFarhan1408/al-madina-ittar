/**
 * SearchBar — slim search field: leading search icon, clear button, sunken fill.
 */
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { FontFamily, FontSize, HitSlop, IconSize, Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search fragrances, notes…',
  onSubmit,
  autoFocus,
  style,
}: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceSunken, borderColor: colors.border },
        style,
      ]}
    >
      <Search size={IconSize.sm} color={colors.text.secondary} strokeWidth={1.5} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        selectionColor={colors.accent}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        autoCorrect={false}
        accessibilityLabel="Search fragrances"
        style={[styles.input, { color: colors.text.primary }]}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={HitSlop}
          onPress={() => onChangeText('')}
          style={[styles.clear, { backgroundColor: colors.border }]}
        >
          <X size={12} color={colors.text.primary} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    paddingVertical: 0,
    alignSelf: 'stretch',
  },
  clear: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
