/**
 * ForgotPasswordScreen — requests a reset email. Backend always responds 200 whether
 * or not the account exists (anti-enumeration), so the success copy is generic.
 */
import { Mail } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, FormField, Text } from '@/components/ui';
import { IconSize, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { authService } from '@/services';
import { toast } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPasswordScreen() {
  const { colors } = useTheme();
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

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email and we'll send you a reset link."
    >
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

      <Button
        label="Send Reset Link"
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
