import { zodResolver } from '@hookform/resolvers/zod';
import { PASSWORD_RULES, registerSchema, type RegisterInput } from '@padosipro/shared';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, type TextInput } from 'react-native';
import { BrandHeader } from '@/components/brand';
import { InlineAlert } from '@/components/feedback';
import { FormTextField } from '@/components/forms';
import { AppText, Button, Screen } from '@/components/ui';
import { ROUTES } from '@/constants';
import { applyFieldErrors, getErrorMessage } from '@/helpers';
import { useRegister } from '@/hooks';
import { colors, spacing } from '@/theme';

export function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const { control, handleSubmit, setError, trigger, getFieldState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { otp } = await register.mutateAsync(values);
      router.push({
        pathname: ROUTES.VERIFY,
        params: { email: otp.email, expiresAt: otp.expiresAt, resendAvailableAt: otp.resendAvailableAt, from: 'register' },
      });
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['email', 'password', 'confirmPassword'])) setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen
      footer={
        <>
          <Button title="Create account" onPress={onSubmit} loading={register.isPending} />
          <View style={styles.switchRow}>
            <AppText variant="small" color="textMuted">
              Already have an account?
            </AppText>
            <Link href={ROUTES.LOGIN} replace style={styles.link}>
              Log in
            </Link>
          </View>
        </>
      }
    >
      <BrandHeader title="Welcome" subtitle="Create your account. We'll send a verification code to your email." />

      <View style={styles.form}>
        {formError && <InlineAlert message={formError} />}
        <FormTextField
          control={control}
          name="email"
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <FormTextField
          ref={passwordRef}
          control={control}
          name="password"
          label="Password"
          icon="lock"
          placeholder="Create a password"
          hint={`At least ${PASSWORD_RULES.MIN_LENGTH} characters, with a letter and a number.`}
          secureToggle
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onChangeText={() => {
            // Keep the "passwords match" message honest while the first field changes.
            if (getFieldState('confirmPassword').isTouched) void trigger('confirmPassword');
          }}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <FormTextField
          ref={confirmRef}
          control={control}
          name="confirmPassword"
          label="Confirm password"
          icon="lock"
          placeholder="Type it again"
          secureToggle
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
