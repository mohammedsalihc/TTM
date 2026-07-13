import { brevoClient } from '../configs/brevo';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export class MailService {
  send = async ({ to, subject, html }: SendMailParams): Promise<void> => {
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { email: process.env.BREVO_SENDER_EMAIL as string, name: 'TTM' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
  };
}
