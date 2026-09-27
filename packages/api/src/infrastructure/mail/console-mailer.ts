import type { ILogger, IMailer, MailMessage } from '../../interfaces';

/** Development fallback: prints the email (and so the OTP) to the terminal instead of sending it. */
export class ConsoleMailer implements IMailer {
  constructor(private readonly logger: ILogger) {}

  async send(message: MailMessage): Promise<void> {
    this.logger.info({ to: message.to, subject: message.subject }, 'Email written to console (MAIL_DRIVER=console)');
    console.log(`\n┌── EMAIL to ${message.to}\n│ ${message.subject}\n│\n${message.text.replace(/^/gm, '│ ')}\n└──\n`);
  }
}
