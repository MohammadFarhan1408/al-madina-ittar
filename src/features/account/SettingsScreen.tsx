/**
 * SettingsScreen — appearance (light/dark/system, live), notification toggles, region
 * rows and app version. Theme preference persists via the ThemeProvider; signed-in
 * choices also sync to the server's preferences.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout';
import { ListGroup, MenuRow, SegmentedControl, Text, Toggle } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme, useThemeControls, type ThemePreference } from '@/core/theme';
import { AppConfig } from '@/core/config';
import { usePreferences, useUpdatePreferences } from '@/hooks/queries';
import { useSessionStore } from '@/store';

const MODES: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Preferences" title="Settings" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.giant }]}
      >
        <View style={styles.block}>
          <Text variant="overline" color="muted" accessibilityRole="header">
            APPEARANCE
          </Text>
          <SegmentedControl
            accessibilityLabel="Theme"
            options={MODES}
            value={preference}
            onChange={chooseTheme}
          />
          <Text variant="caption" color="muted">
            {preference === 'system' ? 'Follows your device setting.' : `Always ${preference}.`}
          </Text>
        </View>

        <ListGroup
          title="Notifications"
          footnote={!isAuthenticated ? 'Sign in to manage your notification preferences.' : undefined}
        >
          <MenuRow
            title="Promotions & Offers"
            subtitle="Private sales and new launches"
            showChevron={false}
            right={
              <Toggle
                value={promos}
                disabled={controlsDisabled}
                onValueChange={togglePromos}
                accessibilityLabel="Promotions and offers"
              />
            }
          />
          <MenuRow
            title="Order Updates"
            subtitle="Shipping and delivery alerts"
            showChevron={false}
            right={
              <Toggle
                value={orderUpdates}
                disabled={controlsDisabled}
                onValueChange={toggleOrderUpdates}
                accessibilityLabel="Order updates"
              />
            }
          />
        </ListGroup>

        <ListGroup title="Region">
          <MenuRow
            title="Currency"
            showChevron={false}
            right={<Text variant="body" color="secondary">{preferences.data?.currency ?? AppConfig.defaultCurrency}</Text>}
          />
          <MenuRow
            title="Language"
            showChevron={false}
            right={<Text variant="body" color="secondary">{preferences.data?.language === 'ar' ? 'العربية' : 'English'}</Text>}
          />
        </ListGroup>

        <Text variant="overline" color="muted" align="center">
          {AppConfig.name.toUpperCase()} · VERSION {AppConfig.version}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Layout.screenPadding, paddingTop: Spacing.xl, gap: Spacing.xxl },
  block: { gap: Spacing.sm },
});
