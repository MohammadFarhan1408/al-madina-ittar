/**
 * ResetPasswordScreen — takes the link/token from the reset email plus a new password.
 */
import { useForm } from 'react-hook-form';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button, FormField } from '@/components/ui';
import { authService } from '@/services';
import { toast } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import { AuthLayout, AuthLink } from '../components/AuthLayout';
import { PasswordField } from '../components/PasswordField';

export function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { control, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? '', password: '' },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await authService.resetPassword(values.token, values.password);
      haptics.success();
      toast.success('Password updated. Please sign in.');
      router.replace('/(auth)/login');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Reset failed. Please request a new link.'));
    }
  };
  const submit = handleSubmit(onSubmit);

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Paste the reset code from your email, then set your new password."
      footer={<AuthLink label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />}
    >
      <FormField
        control={control}
        name="token"
        label="Reset Code"
        placeholder="Code from your email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        returnKeyType="next"
      />
      <PasswordField
        control={control}
        name="password"
        label="New Password"
        isNew
        hint="8+ characters, including a letter and a number."
        onSubmitEditing={submit}
      />
      <Button label="Update Password" loading={formState.isSubmitting} onPress={submit} />
    </AuthLayout>
  );
}
