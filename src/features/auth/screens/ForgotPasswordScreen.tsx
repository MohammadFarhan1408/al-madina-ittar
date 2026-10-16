/**
 * ForgotPasswordScreen — requests a reset email. Backend always responds 200 whether
 * or not the account exists (anti-enumeration), so the success copy is generic.
 */
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';

import { Button, FormField } from '@/components/ui';
import { authService } from '@/services';
import { toast } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';
import { AuthLayout, AuthLink } from '../components/AuthLayout';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authService.forgotPassword(values.email);
      haptics.success();
      toast.success('If that account exists, a reset email is on its way.');
      router.push('/(auth)/reset-password');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Something went wrong. Please try again.'));
    }
  };
  const submit = handleSubmit(onSubmit);

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot password"
      subtitle="Enter the email on your account and we’ll send you a reset code."
      footer={<AuthLink label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />}
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
        returnKeyType="send"
        onSubmitEditing={submit}
      />
      <Button label="Send Reset Code" loading={formState.isSubmitting} onPress={submit} />
    </AuthLayout>
  );
}
