import { Nodemailer } from './providers/nodemailer';

export type EmailProviders = Nodemailer;
export enum EMAIl_PROVIDERS {
  nodemailer = 'nodemailer',
  resend = 'resend',
}
export interface EmailClient {
  send(html: string, options: EmailOptions): any;
}
export type EmailOptions = {
  senderName: string;
  senderEmail: string;
  subject: string;
  recipient: string;
  context: any;
  templateName?: string;
};
export type EmailConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  apiKey: string;
};
