import { Compass } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui';
import { Screen } from '@/components/layout';
import { IconSize } from '@/constants';
import { useTheme } from '@/core/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <Screen padded>
        <EmptyState
          icon={<Compass size={IconSize.xxl} color={colors.accent} strokeWidth={1.5} />}
          title="Lost in the souk"
          message="The page you were looking for doesn't exist."
          actionLabel="Back to Home"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
    </>
  );
}
