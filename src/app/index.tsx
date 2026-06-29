import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { SplashScreen } from '@/features/splash';
import { useOnboarding } from '@/hooks/use-onboarding';

/** Entry gate: play the animated splash, then route to onboarding (first launch) or tabs. */
export default function Index() {
  const router = useRouter();
  const { status } = useOnboarding();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashDone && status !== 'loading') {
      router.replace(status === 'complete' ? '/(tabs)' : '/onboarding');
    }
  }, [splashDone, status, router]);

  return <SplashScreen onDone={() => setSplashDone(true)} />;
}
