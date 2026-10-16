/**
 * PasswordField — a FormField for passwords with a show/hide toggle (44pt target) and
 * the right autofill hints, so iOS/Android password managers can fill or suggest.
 */
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable } from 'react-native';
import type { Control, FieldValues, Path } from 'react-hook-form';

import { FormField } from '@/components/ui';
import { useTheme } from '@/core/theme';

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label = 'Password',
  isNew = false,
  hint,
  onSubmitEditing,
}: {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  /** True when choosing a password (register/reset) → "new password" autofill. */
  isNew?: boolean;
  hint?: string;
  onSubmitEditing?: () => void;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      placeholder={isNew ? 'At least 8 characters' : 'Your password'}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={isNew ? 'new-password' : 'current-password'}
      textContentType={isNew ? 'newPassword' : 'password'}
      returnKeyType="go"
      onSubmitEditing={onSubmitEditing}
      hint={hint}
      rightIcon={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((v) => !v)}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            marginRight: -12,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          {visible ? (
            <EyeOff size={18} color={colors.text.secondary} strokeWidth={1.5} />
          ) : (
            <Eye size={18} color={colors.text.secondary} strokeWidth={1.5} />
          )}
        </Pressable>
      }
    />
  );
}
