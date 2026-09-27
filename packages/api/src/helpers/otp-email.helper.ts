import { OTP_RULES } from '@padosipro/shared';
import type { MailMessage } from '../interfaces';

/** Builds the verification email. Kept separate so copy changes never touch the OTP logic. */
export function buildOtpEmail(to: string, code: string): MailMessage {
  const minutes = OTP_RULES.TTL_SECONDS / 60;
  return {
    to,
    subject: `${code} is your PadosiPro verification code`,
    text: [
      'Welcome to PadosiPro!',
      '',
      `Your verification code is ${code}.`,
      `It expires in ${minutes} minutes and can be used once.`,
      '',
      "If you didn't create a PadosiPro account, you can ignore this email.",
    ].join('\n'),
    html: `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#FAFAF7;padding:32px">
        <div style="max-width:440px;margin:0 auto;background:#fff;border:1px solid #EAECF0;border-radius:16px;padding:32px">
          <p style="margin:0 0 4px;color:#667085;font-size:12px;font-weight:700;letter-spacing:.5px">PadosiPro</p>
          <h1 style="margin:0 0 16px;color:#101828;font-size:24px">Verify your email</h1>
          <p style="margin:0 0 24px;color:#667085;font-size:15px">Enter this code in the app to finish signing up.</p>
          <p style="margin:0 0 24px;color:#155C49;font-size:36px;font-weight:700;letter-spacing:8px">${code}</p>
          <p style="margin:0;color:#667085;font-size:13px">It expires in ${minutes} minutes and can be used once.
          If you didn't create a PadosiPro account, you can ignore this email.</p>
        </div>
      </div>`,
  };
}
