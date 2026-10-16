/**
 * RegisterScreen — creates the account, merges guest cart/wishlist and returns to where
 * the user came from (or Home). Password policy mirrors the backend (schemas.ts).
 */
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';

import { Button, FormField } from '@/components/ui';
import { syncGuestDataOnLogin } from '@/services/session-sync';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { registerSchema, type RegisterValues } from '../schemas';
import { AuthLayout, AuthLink } from '../components/AuthLayout';
import { PasswordField } from '../components/PasswordField';

export function RegisterScreen() {
  const router = useRouter();
  const signUp = useSessionStore((s) => s.signUp);
  const { control, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await signUp(values.fullName, values.email, values.password);
      await syncGuestDataOnLogin().catch(() => undefined);
      haptics.success();
      toast.success('Welcome to Al Madina');
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed. Please try again.'));
    }
  };
  const submit = handleSubmit(onSubmit);

  return (
    <AuthLayout
      eyebrow="Join the Maison"
      title="Create account"
      subtitle="Save your favourites, track orders and check out in moments."
      footer={<AuthLink prompt="Already a member?" label="Sign in" onPress={() => router.replace('/(auth)/login')} />}
    >
      <FormField
        control={control}
        name="fullName"
        label="Full Name"
        placeholder="Your name"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
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
      <PasswordField
        control={control}
        name="password"
        isNew
        hint="8+ characters, including a letter and a number."
        onSubmitEditing={submit}
      />

      <Button label="Create Account" loading={formState.isSubmitting} onPress={submit} />
    </AuthLayout>
  );
}
