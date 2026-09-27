import { Feather } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/theme';
import type { IconName } from '@/utils';
import { AppText } from './app-text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  /** Fixed text before the input, e.g. "+91". */
  prefix?: string;
  /** Shows an eye toggle and hides the text by default. */
  secureToggle?: boolean;
  optional?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, icon, prefix, secureToggle, optional, multiline, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <AppText variant="label" color="textMuted">
          {label}
        </AppText>
        {optional && (
          <AppText variant="caption" color="textSubtle">
            Optional
          </AppText>
        )}
      </View>

      <View style={[styles.field, multiline && styles.fieldMultiline, { borderColor }]}>
        {icon && <Feather name={icon} size={sizes.iconMd} color={colors.textMuted} style={multiline && styles.iconTop} />}
        {prefix && (
          <AppText variant="bodyStrong" style={styles.prefix}>
            {prefix}
          </AppText>
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureToggle ? hidden : inputProps.secureTextEntry}
          multiline={multiline}
          accessibilityLabel={label}
          accessibilityHint={error}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
        {secureToggle && (
          <Pressable
            hitSlop={12}
            onPress={() => setHidden((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={sizes.iconMd} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={14} color={colors.danger} />
          <AppText variant="caption" color="danger" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color="textMuted" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  field: {
    minHeight: sizes.inputHeight,
    borderWidth: sizes.borderWidth,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fieldMultiline: { alignItems: 'flex-start', paddingVertical: spacing.md },
  iconTop: { marginTop: 2 },
  prefix: { color: colors.text },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    // Removes the focus ring react-native-web adds; the border already shows focus.
    outlineStyle: 'none',
  } as object,
  inputMultiline: { minHeight: 72, paddingVertical: 0, textAlignVertical: 'top' },
  messageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  messageText: { flex: 1 },
  hint: {},
});
