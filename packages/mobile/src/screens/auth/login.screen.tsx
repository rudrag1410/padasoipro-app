import { zodResolver } from '@hookform/resolvers/zod';
import { ERROR_CODES, loginSchema, type LoginInput, type OtpChallenge } from '@padosipro/shared';
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
import { useLogin } from '@/hooks';
import { ApiError } from '@/services/api';
import { colors, spacing } from '@/theme';

export function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
      // Success: the auth guard moves us on.
    } catch (error) {
      if (error instanceof ApiError && error.code === ERROR_CODES.EMAIL_NOT_VERIFIED) {
        const otp = error.meta.otp as OtpChallenge | undefined;
        router.push({
          pathname: ROUTES.VERIFY,
          params: { email: otp?.email ?? values.email.trim().toLowerCase(), expiresAt: otp?.expiresAt, resendAvailableAt: otp?.resendAvailableAt, from: 'login' },
        });
        return;
      }
      if (!applyFieldErrors(error, setError, ['email', 'password'])) setFormError(getErrorMessage(error));
    }
  });

  return (
    <Screen
      footer={
        <>
          <Button title="Log in" onPress={onSubmit} loading={login.isPending} />
          <View style={styles.switchRow}>
            <AppText variant="small" color="textMuted">
              New to PadosiPro?
            </AppText>
            <Link href={ROUTES.REGISTER} replace style={styles.link}>
              Create an account
            </Link>
          </View>
        </>
      }
    >
      <BrandHeader title="Welcome back" subtitle="Log in with your email and password." />

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
          placeholder="Your password"
          secureToggle
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
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
