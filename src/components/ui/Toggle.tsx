/** Toggle — the platform Switch, themed: gold track when on, quiet sunken track when off. */
import { Switch, type SwitchProps } from 'react-native';

import { Palette } from '@/constants/colors';
import { useTheme } from '@/core/theme';

export function Toggle(props: SwitchProps) {
  const { colors } = useTheme();
  return (
    <Switch
      trackColor={{ false: colors.borderStrong, true: colors.accent }}
      thumbColor={Palette.ivoryText}
      ios_backgroundColor={colors.borderStrong}
      {...props}
    />
  );
}
