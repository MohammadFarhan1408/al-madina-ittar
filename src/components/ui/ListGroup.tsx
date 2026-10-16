/**
 * ListGroup — a titled, hairline-framed group of rows (MenuRow, toggles, info lines).
 * The shared shape for Profile, Settings and Contact so every list in the app reads alike.
 */
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { Divider } from './Divider';
import { Text } from './Text';

export type ListGroupProps = {
  title?: string;
  /** Quiet note under the group (e.g. "Sign in to change these"). */
  footnote?: string;
  /** Insert hairline dividers between children automatically (default true). */
  divided?: boolean;
  children: ReactNode;
  style?: ViewStyle;
};

export function ListGroup({ title, footnote, divided = true, children, style }: ListGroupProps) {
  const { colors } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <View style={[styles.group, style]}>
      {title ? (
        <Text variant="overline" color="muted" accessibilityRole="header">
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.body, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {items.map((child, i) => (
          <Fragment key={child.key ?? i}>
            {divided && i > 0 ? <Divider /> : null}
            {child}
          </Fragment>
        ))}
      </View>
      {footnote ? (
        <Text variant="caption" color="muted">
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.sm },
  body: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg },
});
