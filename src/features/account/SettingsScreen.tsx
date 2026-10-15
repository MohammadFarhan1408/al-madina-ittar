/**
 * SettingsScreen — appearance (light/dark/system, live), notification toggles, region
 * rows and app version. Theme preference persists via the ThemeProvider.
 */
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ArtDecoDivider } from '@/components/brand';
import { StackHeader } from '@/components/layout';
import { Card, Chip, Divider, MenuRow, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme, useThemeControls, type ThemePreference } from '@/core/theme';
import { AppConfig } from '@/core/config';
import { usePreferences, useUpdatePreferences } from '@/hooks/queries';
import { useSessionStore } from '@/store';

const MODES: { key: ThemePreference; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

export function SettingsScreen() {
  const { colors } = useTheme();
  const { preference, setPreference } = useThemeControls();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  // Switches reflect the server's saved preferences (optimistic on toggle); signed-out
  // users see the defaults and can't change them.
  const promos = preferences.data?.promosEnabled ?? true;
  const orderUpdates = preferences.data?.orderUpdatesEnabled ?? true;
  const togglePromos = (value: boolean) => updatePreferences.mutate({ promosEnabled: value });
  const toggleOrderUpdates = (value: boolean) => updatePreferences.mutate({ orderUpdatesEnabled: value });
  const chooseTheme = (mode: ThemePreference) => {
    setPreference(mode);
    if (isAuthenticated) updatePreferences.mutate({ themeMode: mode });
  };
  const controlsDisabled = !isAuthenticated || preferences.isLoading;

  const switchTrack = { false: colors.surfaceSunken, true: colors.accent };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Preferences" title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ArtDecoDivider label="APPEARANCE" style={styles.divider} />
        <Card>
          <Text variant="bodyStrong" style={styles.cardTitle}>
            Theme
          </Text>
          <View style={styles.modes}>
            {MODES.map((mode) => (
              <Chip
                key={mode.key}
                label={mode.label}
                selected={preference === mode.key}
                onPress={() => chooseTheme(mode.key)}
              />
            ))}
          </View>
        </Card>

        <ArtDecoDivider label="NOTIFICATIONS" style={styles.divider} />
        {!isAuthenticated ? (
          <Text variant="caption" color="muted" align="center">
            Sign in to manage your notification preferences.
          </Text>
        ) : null}
        <Card padded={false}>
          <View style={styles.menuInner}>
            <MenuRow
              title="Promotions & Offers"
              subtitle="Private sales and new launches"
              showChevron={false}
              right={<Switch value={promos} disabled={controlsDisabled} onValueChange={togglePromos} accessibilityLabel="Promotions and offers" trackColor={switchTrack} thumbColor={colors.surface} />}
            />
            <Divider />
            <MenuRow
              title="Order Updates"
              subtitle="Shipping and delivery alerts"
              showChevron={false}
              right={<Switch value={orderUpdates} disabled={controlsDisabled} onValueChange={toggleOrderUpdates} accessibilityLabel="Order updates" trackColor={switchTrack} thumbColor={colors.surface} />}
            />
          </View>
        </Card>

        <ArtDecoDivider label="REGION" style={styles.divider} />
        <Card padded={false}>
          <View style={styles.menuInner}>
            <MenuRow title="Currency" subtitle={preferences.data?.currency ?? AppConfig.defaultCurrency} showChevron={false} />
            <Divider />
            <MenuRow title="Language" subtitle={preferences.data?.language === 'ar' ? 'العربية' : 'English'} showChevron={false} />
          </View>
        </Card>

        <Text variant="caption" color="muted" align="center" style={styles.version}>
          {AppConfig.name} · Version {AppConfig.version}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  divider: { alignSelf: 'center', marginTop: Spacing.sm },
  cardTitle: { marginBottom: Spacing.md },
  modes: { flexDirection: 'row', gap: Spacing.sm },
  menuInner: { paddingHorizontal: Spacing.lg },
  version: { marginTop: Spacing.lg },
});
