/**
 * Composes all global providers in the correct order:
 * GestureHandler → SafeArea → Query → Theme, with the Toast host mounted last so it
 * overlays all content while still inside the theme.
 */
import { useEffect, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui/Toast';
import { ThemeProvider } from '@/core/theme';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { startBackgroundSync } from '@/services/session-sync';
import { useSessionStore } from '@/store';
import { QueryProvider } from './query-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useSessionStore.getState().hydrateFromToken();
    startBackgroundSync();
  }, []);

  usePushRegistration();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <ToastHost />
          </ThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
