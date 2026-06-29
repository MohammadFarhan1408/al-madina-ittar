/**
 * Tracks whether the user has completed onboarding (persisted). `status` is 'loading'
 * until the flag is hydrated so the gate can avoid flicker.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { StorageKeys } from '@/constants';

type Status = 'loading' | 'pending' | 'complete';

export function useOnboarding() {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(StorageKeys.onboardingComplete).then((value) => {
      if (active) setStatus(value === 'true' ? 'complete' : 'pending');
    });
    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(StorageKeys.onboardingComplete, 'true');
    setStatus('complete');
  }, []);

  return { status, complete };
}
