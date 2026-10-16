/**
 * LoginScreen — signs in, merges guest cart/wishlist (`syncGuestDataOnLogin`), and
 * returns the user to where they came from (or Home).
 */
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormField, Text } from '@/components/ui';
import { HitSlop } from '@/constants';
import { syncGuestDataOnLogin } from '@/services/session-sync';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { loginSchema, type LoginValues } from '../schemas';
import { AuthLayout, AuthLink } from '../components/AuthLayout';
import { PasswordField } from '../components/PasswordField';

export function LoginScreen() {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const { control, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await signIn(values.email, values.password);
      await syncGuestDataOnLogin().catch(() => undefined);
      haptics.success();
      toast.success('Welcome back to the Maison');
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    } catch (err) {
      haptics.warning();
      toast.error(getErrorMessage(err, 'Sign in failed. Please try again.'));
    }
  };
  const submit = handleSubmit(onSubmit);

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Access your orders, saved fragrances and faster checkout."
      footer={<AuthLink prompt="New to Al Madina?" label="Create an account" onPress={() => router.replace('/(auth)/register')} />}
    >
      <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <PasswordField control={control} name="password" onSubmitEditing={submit} />

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Forgot password"
        hitSlop={HitSlop}
        onPress={() => router.push('/(auth)/forgot-password')}
        style={({ pressed }) => [styles.forgot, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Text variant="caption" color="secondary" style={styles.underline}>
          Forgot password?
        </Text>
      </Pressable>

      <Button label="Sign In" loading={formState.isSubmitting} onPress={submit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center', marginTop: -4 },
  underline: { textDecorationLine: 'underline' },
});
