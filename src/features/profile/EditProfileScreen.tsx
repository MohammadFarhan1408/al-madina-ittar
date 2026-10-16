/**
 * EditProfileScreen — `PATCH /users/me` (name + avatar URL). Email is read-only; the
 * backend has no change-email, change-password or avatar-upload endpoint, so the screen
 * says so plainly instead of offering controls that can't work.
 */
import { router } from 'expo-router';
import { Lock, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/layout';
import { Avatar, Button, EmptyState, FormField, Input, Text } from '@/components/ui';
import { IconSize, Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { editProfileSchema, type EditProfileValues } from './schema';

export function EditProfileScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useSessionStore((s) => s.user);
  const updateProfile = useSessionStore((s) => s.updateProfile);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, formState } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: user?.fullName ?? '', avatar: user?.avatar ?? '' },
  });

  const avatarUrl = useWatch({ control, name: 'avatar' });
  const nameValue = useWatch({ control, name: 'fullName' });

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StackHeader overline="Account" title="Edit Profile" />
        <EmptyState
          icon={<UserRound size={IconSize.lg} color={colors.text.secondary} strokeWidth={1.25} />}
          title="Sign in to edit your profile"
          actionLabel="Sign in"
          actionVariant="primary"
          onAction={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  const onSubmit = async (values: EditProfileValues) => {
    setSaving(true);
    try {
      // The API rejects an empty avatar, so it is only sent when set.
      await updateProfile({ fullName: values.fullName, ...(values.avatar ? { avatar: values.avatar } : {}) });
      haptics.success();
      toast.success('Profile updated');
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StackHeader overline="Account" title="Edit Profile" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.giant }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarBlock}>
            <View style={[styles.avatarRing, { borderColor: colors.border }]}>
              <Avatar uri={avatarUrl || undefined} name={nameValue || user.fullName} size="xl" />
            </View>
            <Text variant="title" align="center" numberOfLines={1}>
              {nameValue?.trim() || user.fullName}
            </Text>
            <Text variant="caption" color="muted" align="center">
              Preview updates as you type
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              control={control}
              name="fullName"
              label="Full Name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
            <FormField
              control={control}
              name="avatar"
              label="Photo URL (optional)"
              placeholder="https://…"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              hint="Paste a link to a square image."
            />
            <Input
              label="Email"
              value={user.email}
              editable={false}
              hint="Your sign-in email can't be changed in the app."
              rightIcon={<Lock size={15} color={colors.text.muted} strokeWidth={1.5} />}
            />
          </View>

          <Button
            label="Save Changes"
            loading={saving}
            disabled={saving || !formState.isDirty}
            onPress={handleSubmit(onSubmit)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl, gap: Spacing.xxl },
  avatarBlock: { alignItems: 'center', gap: Spacing.sm },
  avatarRing: { padding: 5, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth * 2, marginBottom: Spacing.sm },
  form: { gap: Spacing.lg },
});
