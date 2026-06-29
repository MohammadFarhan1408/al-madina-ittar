/**
 * FormField — React Hook Form Controller wrapped around the themed Input. Surfaces
 * validation errors (e.g. from a Zod resolver) under the field.
 */
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { type ReactNode } from 'react';

import { Input, type InputProps } from './Input';

export type FormFieldProps<T extends FieldValues> = Omit<InputProps, 'value' | 'onChangeText' | 'error'> & {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          value={(value as string) ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
