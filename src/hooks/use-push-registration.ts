/**
 * Registers this device's Expo push token with the backend once the user is
 * authenticated. `POST /users/me/push-token` is a real, working endpoint, but actual
 * push delivery is still stubbed server-side (logs only) — registering now just avoids
 * doing this integration twice later. No unregister call exists, so a stale token from
 * a previous user just gets silently reassigned on that user's next registration.
 *
 * Requires an EAS `projectId` to mint a push token; without one (no EAS project
 * configured yet) this silently no-ops rather than throwing.
 */
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect } from 'react';

import { apiClient } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import { useSessionStore } from '@/store';

async function registerPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await apiClient.post(Endpoints.users.pushToken, {
    token,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
  });
}

export function usePushRegistration() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    registerPushToken().catch(() => undefined);
  }, [isAuthenticated]);
}
