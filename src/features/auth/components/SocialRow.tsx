/** Social sign-in row (visual only) with a labelled divider. */
import { Apple, Globe } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { SocialButton, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { Palette } from '@/constants/colors';
import { toast } from '@/store';

export function SocialRow() {
  const notImplemented = () => toast.info('Social sign-in is coming soon');
  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text variant="label" colorValue={Palette.stone} uppercase>
          or continue with
        </Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        <SocialButton
          icon={<Apple size={IconSize.sm} color={Palette.ivory} strokeWidth={1.75} />}
          label="Apple"
          onPress={notImplemented}
        />
        <SocialButton
          icon={<Globe size={IconSize.sm} color={Palette.ivory} strokeWidth={1.75} />}
          label="Google"
          onPress={notImplemented}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.lg },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Palette.smoke },
  row: { flexDirection: 'row', gap: Spacing.md },
});
