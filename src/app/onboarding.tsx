import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function OnboardingRoute() {
  const router = useRouter();
  const { complete } = useOnboarding();

  const handleDone = async () => {
    await complete();
    router.replace('/(tabs)');
  };

  return <OnboardingScreen onDone={handleDone} />;
}
