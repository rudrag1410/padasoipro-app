import { ERROR_CODES, OTP_RULES, type OtpChallenge } from '@padosipro/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInput } from 'react-native';
import { BrandHeader } from '@/components/brand';
import { InlineAlert } from '@/components/feedback';
import { AppText, Button, OtpInput, Screen, ScreenHeader } from '@/components/ui';
import { ROUTES } from '@/constants';
import { formatCountdown, getErrorMessage, maskEmail } from '@/helpers';
import { useCountdown, useResendOtp, useVerifyOtp } from '@/hooks';
import { ApiError } from '@/services/api';
import { colors, spacing } from '@/theme';
import type { VerifyParams } from '@/types';

type Feedback = { tone: 'error' | 'success' | 'warning'; message: string } | null;

/** Codes that mean the current code can't succeed any more; only a resend helps. */
const DEAD_CODE_ERRORS: string[] = [ERROR_CODES.OTP_EXPIRED, ERROR_CODES.OTP_ATTEMPTS_EXCEEDED, ERROR_CODES.OTP_NOT_FOUND];

export function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<VerifyParams>();
  const email = params.email ?? '';

  const verify = useVerifyOtp();
  const resend = useResendOtp();
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [codeIsDead, setCodeIsDead] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(
    params.from === 'login' ? { tone: 'warning', message: 'Your email is not verified yet. Enter the code we sent you.' } : null,
  );
  const [challenge, setChallenge] = useState<Pick<OtpChallenge, 'expiresAt' | 'resendAvailableAt'>>({
    expiresAt: params.expiresAt ?? '',
    resendAvailableAt: params.resendAvailableAt ?? '',
  });

  const resendIn = useCountdown(challenge.resendAvailableAt);
  const expiresIn = useCountdown(challenge.expiresAt);
  const expired = Boolean(challenge.expiresAt) && expiresIn === 0;
  const canSubmit = code.length === OTP_RULES.LENGTH && !codeIsDead && !expired;

  const submit = async (value = code) => {
    if (value.length !== OTP_RULES.LENGTH || verify.isPending) return;
    setFeedback(null);
    try {
      await verify.mutateAsync({ email, code: value });
      // Signed in: the auth guard takes over.
    } catch (error) {
      setCode('');
      if (error instanceof ApiError && error.code === ERROR_CODES.EMAIL_ALREADY_VERIFIED) {
        router.replace(ROUTES.LOGIN);
        return;
      }
      if (error instanceof ApiError && DEAD_CODE_ERRORS.includes(error.code)) setCodeIsDead(true);
      setFeedback({ tone: 'error', message: getErrorMessage(error) });
      inputRef.current?.focus();
    }
  };

  const onResend = async () => {
    setFeedback(null);
    try {
      const { otp } = await resend.mutateAsync(email);
      setChallenge(otp);
      setCode('');
      setCodeIsDead(false);
      setFeedback({ tone: 'success', message: `A new code is on its way to ${maskEmail(email)}.` });
      inputRef.current?.focus();
    } catch (error) {
      // Cooldown: the server tells us the real timing, so sync the countdown to it.
      if (error instanceof ApiError && error.code === ERROR_CODES.OTP_RESEND_COOLDOWN) {
        const otp = error.meta.otp as OtpChallenge | undefined;
        if (otp) setChallenge(otp);
      }
      setFeedback({ tone: 'error', message: getErrorMessage(error) });
    }
  };

  if (!email) {
    // Opened without context (e.g. a stale deep link): nothing to verify.
    return (
      <Screen>
        <BrandHeader title="Verify your email" subtitle="We couldn't tell which email to verify. Please log in again." />
        <Button title="Go to log in" onPress={() => router.replace(ROUTES.LOGIN)} />
      </Screen>
    );
  }

  return (
    <Screen
      header={<ScreenHeader onBack={() => (router.canGoBack() ? router.back() : router.replace(ROUTES.LOGIN))} />}
      footer={
        <Button title="Verify email" onPress={() => submit()} loading={verify.isPending} disabled={!canSubmit} />
      }
    >
      <BrandHeader
        showLogo={false}
        title="Verify your email"
        subtitle={`Enter the ${OTP_RULES.LENGTH}-digit code we sent to ${maskEmail(email)}.`}
      />

      <View style={styles.body}>
        <OtpInput
          ref={inputRef}
          value={code}
          onChange={(value) => {
            setCode(value);
            if (feedback?.tone === 'error' && !codeIsDead) setFeedback(null);
          }}
          onComplete={(value) => void submit(value)}
          hasError={feedback?.tone === 'error'}
          disabled={verify.isPending || codeIsDead || expired}
        />

        {feedback && <InlineAlert tone={feedback.tone} message={feedback.message} />}
        {!feedback && expired && <InlineAlert tone="error" message="This code has expired. Request a new one below." />}

        {challenge.expiresAt && !expired && !codeIsDead && (
          <AppText variant="small" color="textMuted" align="center">
            Code expires in {formatCountdown(expiresIn)}
          </AppText>
        )}

        <View style={styles.resendRow}>
          <AppText variant="small" color="textMuted">
            Didn't get the code?
          </AppText>
          {resendIn > 0 ? (
            <AppText variant="smallStrong" color="textSubtle" accessibilityLiveRegion="polite">
              Resend in {formatCountdown(resendIn)}
            </AppText>
          ) : (
            <Pressable onPress={onResend} disabled={resend.isPending} hitSlop={8} accessibilityRole="button">
              <AppText variant="smallStrong" style={styles.link}>
                {resend.isPending ? 'Sending…' : 'Resend code'}
              </AppText>
            </Pressable>
          )}
        </View>

        <AppText variant="caption" color="textSubtle" align="center">
          Check your spam folder too. Codes are valid for {OTP_RULES.TTL_SECONDS / 60} minutes.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.xl },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  link: { color: colors.primary },
});
