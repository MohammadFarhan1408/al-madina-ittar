/**
 * EditProfileScreen — `PATCH /users/me` (name + avatar URL). Email is read-only; the
 * backend has no change-email, change-password or avatar-upload endpoint.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { StackHeader } from '@/components/layout';
import { Avatar, Button, EmptyState, FormField, Input } from '@/components/ui';
import { Layout, Spacing } from '@/constants';
import { useTheme } from '@/core/theme';
import { toast, useSessionStore } from '@/store';
import { getErrorMessage, haptics, zodResolver } from '@/utils';
import { editProfileSchema, type EditProfileValues } from './schema';

export function EditProfileScreen() {
  const { colors } = useTheme();
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
        <EmptyState title="Sign in to edit your profile" actionLabel="Sign in" onAction={() => router.push('/(auth)/login')} />
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.avatar}>
            <Avatar uri={avatarUrl || undefined} name={nameValue || user.fullName} size="xl" />
          </View>
          <FormField control={control} name="fullName" label="Full Name" autoCapitalize="words" textContentType="name" />
          <FormField control={control} name="avatar" label="Photo URL (optional)" placeholder="https://…" autoCapitalize="none" keyboardType="url" />
          <Input label="Email" value={user.email} editable={false} />
          <Button
            label="Save Changes"
            variant="gradient"
            glow
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
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Spacing.giant },
  avatar: { alignItems: 'center', marginBottom: Spacing.md },
});
