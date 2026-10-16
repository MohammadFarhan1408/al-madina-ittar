/**
 * NewsletterSignup — `POST /newsletter`. Idempotent on the backend, so resubmitting the
 * same address is harmless; shows an inline confirmation instead of a toast.
 * Laid out as a single inline field + action, like a printed RSVP.
 */
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button, Input, Text } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { useSubscribeNewsletter } from '@/hooks/queries';
import { getErrorMessage, haptics } from '@/utils';
import { newsletterSchema } from '@/features/account/schemas';

export function NewsletterSignup() {
  const { colors } = useTheme();
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
      <Text variant="heading" align="center" accessibilityRole="header">
        First to know
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.lede}>
        New launches, private offers and stories from the atelier — a few letters a season.
      </Text>
      {subscribe.isSuccess ? (
        <Animated.View entering={FadeIn.duration(320)} style={[styles.done, { borderColor: colors.border }]}>
          <Check size={16} color={colors.accent} strokeWidth={1.75} />
          <Text variant="body" accessibilityLiveRegion="polite">
            Thank you — welcome to the Maison.
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.form}>
          <Input
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError(null);
            }}
            placeholder="Your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={submit}
            error={error ?? undefined}
            accessibilityLabel="Email address for newsletter"
          />
          <Button label="Subscribe" variant="primary" loading={subscribe.isPending} onPress={submit} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Layout.screenPadding, gap: Spacing.md, alignItems: 'stretch' },
  lede: { alignSelf: 'center', maxWidth: 320, marginBottom: Spacing.md },
  form: { gap: Spacing.md },
  done: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
