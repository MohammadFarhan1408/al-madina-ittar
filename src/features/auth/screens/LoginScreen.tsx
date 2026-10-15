/**
 * LoginScreen — mock/local sign-in. Validates with Zod, writes the session store and
 * returns the user to where they came from (or Home).
 */
import { Lock, Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormField, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { syncGuestDataOnLogin } from '@/services/session-sync';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { loginSchema, type LoginValues } from '../schemas';
import { AuthLayout } from '../components/AuthLayout';
import { SocialRow } from '../components/SocialRow';

export function LoginScreen() {
  const { colors } = useTheme();
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
      toast.error(getErrorMessage(err, 'Sign in failed. Please try again.'));
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your fragrance journey.">
      <FormField
        control={control}
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon={<Mail size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />}
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        leftIcon={<Lock size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />}
      />

      <Text
        variant="body"
        color="accent"
        align="right"
        onPress={() => router.push('/(auth)/forgot-password')}
      >
        Forgot password?
      </Text>

      <Button
        label="Sign In"
        variant="gradient"
        glow
        loading={formState.isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />

      <SocialRow />

      <View style={styles.footer}>
        <Text variant="body" color="secondary">
          New to Al Madina?{' '}
        </Text>
        <Text variant="bodyStrong" color="accent" onPress={() => router.replace('/(auth)/register')}>
          Create account
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
});
