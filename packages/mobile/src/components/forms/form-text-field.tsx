import { forwardRef } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import type { TextInput } from 'react-native';
import { TextField, type TextFieldProps } from '../ui/text-field';

type FormTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, 'value' | 'error'> & {
  control: Control<T>;
  name: Path<T>;
};

/** TextField bound to react-hook-form: value, change, blur and error all wired. */
function FormTextFieldInner<T extends FieldValues>(
  { control, name, onChangeText, onBlur: onBlurProp, ...fieldProps }: FormTextFieldProps<T>,
  ref: React.ForwardedRef<TextInput>,
) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          ref={ref}
          {...fieldProps}
          value={value ?? ''}
          onChangeText={(text) => {
            onChange(text);
            onChangeText?.(text);
          }}
          onBlur={(event) => {
            onBlur();
            onBlurProp?.(event);
          }}
          error={error?.message}
        />
      )}
    />
  );
}

export const FormTextField = forwardRef(FormTextFieldInner) as <T extends FieldValues>(
  props: FormTextFieldProps<T> & { ref?: React.ForwardedRef<TextInput> },
) => React.ReactElement;
