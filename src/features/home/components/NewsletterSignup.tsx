/**
 * NewsletterSignup — `POST /newsletter`. Idempotent on the backend, so resubmitting the
 * same address is harmless; shows an inline confirmation instead of a toast.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArtDecoDivider } from '@/components/brand';
import { Button, Input, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useSubscribeNewsletter } from '@/hooks/queries';
import { getErrorMessage, haptics } from '@/utils';
import { newsletterSchema } from '@/features/account/schemas';

export function NewsletterSignup() {
  const subscribe = useSubscribeNewsletter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Enter a valid email');
    setError(null);
    subscribe.mutate(parsed.data.email, {
      onSuccess: () => haptics.success(),
      onError: (err) => setError(getErrorMessage(err, "Couldn't subscribe. Please try again.")),
    });
  };

  return (
    <View style={styles.wrap}>
      <Text variant="overline" color="accent" align="center">
        THE MAISON LETTER
      </Text>
      <Text variant="title" align="center">
        New launches, private offers
      </Text>
      <ArtDecoDivider width={100} />
      {subscribe.isSuccess ? (
        <Text variant="body" color="accent" align="center" accessibilityLiveRegion="polite">
          Thank you — welcome to the Maison.
        </Text>
      ) : (
        <>
          <Input
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError(null);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={submit}
            error={error ?? undefined}
            accessibilityLabel="Email address for newsletter"
          />
          <Button label="Subscribe" variant="outline" loading={subscribe.isPending} onPress={submit} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Layout.screenPadding, gap: Spacing.md, alignItems: 'stretch' },
});
