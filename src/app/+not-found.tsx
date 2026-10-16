import { Compass } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

import { StackHeader } from '@/components/layout';
import { EmptyState } from '@/components/ui';
import { IconSize } from '@/constants';
import { useTheme } from '@/core/theme';

/** Unknown route — a calm way back instead of a dead end. */
export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StackHeader overline="Page not found" onBack={() => router.replace('/(tabs)')} />
        <EmptyState
          icon={<Compass size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
          title="Lost in the souk"
          message="The page you were looking for doesn't exist or has moved."
          actionLabel="Back to Home"
          actionVariant="primary"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    </>
  );
}
