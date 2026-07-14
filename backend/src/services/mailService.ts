import { brevoClient } from '../configs/brevo';
import { renderTemplate } from '../utils/renderTemplate';
import { welcomeTeamMemberEmailTemplate } from '../templates/welcomeTeamMemberEmail';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

interface WelcomeEmailParams {
  to: string;
  businessName?: string;
  recipientName: string;
  designation: string;
  password: string;
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

  // Shared by Employee and Manager creation — {{designation}} is the only
  // thing that differs between the two invite emails.
  sendWelcomeEmail = async ({ to, businessName, recipientName, designation, password }: WelcomeEmailParams): Promise<void> => {
    const html = renderTemplate(welcomeTeamMemberEmailTemplate, {
      businessName: businessName ?? 'your team',
      recipientName,
      designation,
      email: to,
      password,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      currentYear: new Date().getFullYear().toString(),
    });
    await this.send({ to, subject: `Welcome to ${businessName ?? 'TTM'}`, html });
  };
}
