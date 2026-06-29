/**
 * RegisterScreen — mock/local sign-up. Validates with Zod, creates the session and
 * returns to where the user came from (or Home).
 */
import { Lock, Mail, User } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormField, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useSessionStore } from '@/store';
import { haptics, zodResolver } from '@/utils';
import { registerSchema, type RegisterValues } from '../schemas';
import { AuthLayout } from '../components/AuthLayout';
import { SocialRow } from '../components/SocialRow';

export function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const signUp = useSessionStore((s) => s.signUp);
  const { control, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = (values: RegisterValues) => {
    haptics.success();
    signUp(values.fullName, values.email);
    toast.success('Welcome to Al Madina');
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <AuthLayout title="Join the Maison" subtitle="Create your account and unlock the full collection.">
      <FormField
        control={control}
        name="fullName"
        label="Full Name"
        placeholder="Your name"
        autoCapitalize="words"
        leftIcon={<User size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />}
      />
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

      <Button
        label="Create Account"
        variant="gradient"
        glow
        loading={formState.isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />

      <SocialRow />

      <View style={styles.footer}>
        <Text variant="body" color="secondary">
          Already a member?{' '}
        </Text>
        <Text variant="bodyStrong" color="accent" onPress={() => router.replace('/(auth)/login')}>
          Sign in
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
});
