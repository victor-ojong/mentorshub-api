import { Resend as ResendClient } from 'resend';
import { EmailClient, EmailOptions } from '../email.types';

export type ResendConfig = {
  apiKey: string;
};

export class Resend implements EmailClient {
  resend: ResendClient;
  constructor(config: ResendConfig) {
    this.resend = new ResendClient(config.apiKey);
  }

  async send(message: string, options: EmailOptions) {
    const { senderName, senderEmail, subject, recipient } = options || {};
    const emailData = {
      to: recipient,
      from: senderName ? `${senderName} <${senderEmail}>` : senderEmail,
      subject: subject,
      html: message,
    };
    try {
      await this.resend.sendEmail(emailData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
