/**
 * ResetPasswordScreen — takes the link/token from the reset email plus a new password.
 */
import { Lock, KeyRound } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormField, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { authService } from '@/services';
import type { ApiError } from '@/types';
import { toast } from '@/store';
import { haptics, zodResolver } from '@/utils';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';
import { AuthLayout } from '../components/AuthLayout';

export function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { control, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', password: '' },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await authService.resetPassword(values.token, values.password);
      haptics.success();
      toast.success('Password updated. Please sign in.');
      router.replace('/(auth)/login');
    } catch (err) {
      toast.error((err as ApiError).message ?? 'Reset failed. Please request a new link.');
    }
  };

  return (
    <AuthLayout title="New Password" subtitle="Paste the reset code from your email and choose a new password.">
      <FormField
        control={control}
        name="token"
        label="Reset Code"
        placeholder="Code from your email"
        autoCapitalize="none"
        leftIcon={<KeyRound size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />}
      />
      <FormField
        control={control}
        name="password"
        label="New Password"
        placeholder="••••••••"
        secureTextEntry
        leftIcon={<Lock size={IconSize.sm} color={colors.text.muted} strokeWidth={1.75} />}
      />

      <Button
        label="Update Password"
        variant="gradient"
        glow
        loading={formState.isSubmitting}
        onPress={handleSubmit(onSubmit)}
      />

      <View style={styles.footer}>
        <Text variant="bodyStrong" color="accent" onPress={() => router.replace('/(auth)/login')}>
          Back to sign in
        </Text>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
});
