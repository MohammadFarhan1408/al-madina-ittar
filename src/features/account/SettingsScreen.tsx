/**
 * SettingsScreen — appearance (light/dark/system, live), notification toggles, region
 * rows and app version. Theme preference persists via the ThemeProvider.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ArtDecoDivider } from '@/components/brand';
import { StackHeader } from '@/components/layout';
import { Card, Chip, Divider, MenuRow, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme, useThemeControls, type ThemePreference } from '@/core/theme';
import { AppConfig } from '@/core/config';
import { useUpdatePreferences } from '@/hooks/queries';
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
  const [promos, setPromos] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const updatePreferences = useUpdatePreferences();

  // No `GET /users/me/preferences` exists on the backend, so these switches can't be
  // hydrated from the server on load — they default on and persist writes only.
  const togglePromos = (value: boolean) => {
    setPromos(value);
    if (isAuthenticated) updatePreferences.mutate({ promosEnabled: value });
  };
  const toggleOrderUpdates = (value: boolean) => {
    setOrderUpdates(value);
    if (isAuthenticated) updatePreferences.mutate({ orderUpdatesEnabled: value });
  };

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
                onPress={() => setPreference(mode.key)}
              />
            ))}
          </View>
        </Card>

        <ArtDecoDivider label="NOTIFICATIONS" style={styles.divider} />
        <Card padded={false}>
          <View style={styles.menuInner}>
            <MenuRow
              title="Promotions & Offers"
              subtitle="Private sales and new launches"
              showChevron={false}
              right={<Switch value={promos} onValueChange={togglePromos} trackColor={switchTrack} thumbColor={colors.surface} />}
            />
            <Divider />
            <MenuRow
              title="Order Updates"
              subtitle="Shipping and delivery alerts"
              showChevron={false}
              right={<Switch value={orderUpdates} onValueChange={toggleOrderUpdates} trackColor={switchTrack} thumbColor={colors.surface} />}
            />
          </View>
        </Card>

        <ArtDecoDivider label="REGION" style={styles.divider} />
        <Card padded={false}>
          <View style={styles.menuInner}>
            <MenuRow title="Currency" subtitle={AppConfig.defaultCurrency} onPress={() => undefined} />
            <Divider />
            <MenuRow title="Language" subtitle="English" onPress={() => undefined} />
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
