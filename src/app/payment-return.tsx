/**
 * Landing route for the Stripe return deep link (`…://payment-return`). On iOS the auth
 * session intercepts the link and closes itself; on Android the OS may also deliver it
 * to the router, so just step back to whatever screen opened Stripe (the order screen
 * refetches its own status).
 */
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function PaymentReturnRoute() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, []);
  return null;
}
