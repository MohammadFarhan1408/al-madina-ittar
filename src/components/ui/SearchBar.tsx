/**
 * SearchBar — pill search field with leading search icon and clear button.
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
  placeholder = 'Search fragrances…',
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
      <Search size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        style={[styles.input, { color: colors.text.primary }]}
      />
      {value.length > 0 ? (
        <Pressable hitSlop={HitSlop} onPress={() => onChangeText('')}>
          <X size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
});
