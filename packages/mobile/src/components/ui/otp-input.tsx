import { OTP_RULES } from '@padosipro/shared';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/theme';
import { AppText } from './app-text';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  length?: number;
}

/**
 * One real TextInput (so paste and the OS "one-time code" autofill work),
 * drawn as separate boxes.
 */
export const OtpInput = forwardRef<TextInput, OtpInputProps>(function OtpInput(
  { value, onChange, onComplete, hasError, disabled, length = OTP_RULES.LENGTH },
  ref,
) {
  const [focused, setFocused] = useState(true);
  const digits = value.split('');

  const handleChange = (text: string) => {
    const next = text.replace(/\D/g, '').slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  return (
    <Pressable onPress={() => (ref as React.RefObject<TextInput | null>)?.current?.focus()} accessible={false}>
      <View style={styles.row} pointerEvents="none">
        {Array.from({ length }, (_, index) => {
          const isActive = focused && index === Math.min(value.length, length - 1);
          const borderColor = hasError ? colors.danger : isActive ? colors.primary : digits[index] ? colors.text : colors.border;
          return (
            <View key={index} style={[styles.box, { borderColor }, disabled && styles.disabled]}>
              <AppText style={styles.digit}>{digits[index] ?? ''}</AppText>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        caretHidden
        accessibilityLabel={`${length}-digit verification code`}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  box: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 0.9,
    borderWidth: sizes.borderWidth,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { ...typography.title, color: colors.text },
  disabled: { opacity: 0.5 },
  hiddenInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0.011, color: 'transparent' },
});
