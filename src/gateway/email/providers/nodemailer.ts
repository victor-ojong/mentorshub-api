import * as nodemailer from 'nodemailer';
import { EmailClient, EmailConfig, EmailOptions } from '../email.types';

type EmailAccount = {
  user: any;
  pass: any;
};

export class Nodemailer implements EmailClient {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  enableTestAccount: boolean;

  constructor(config: EmailConfig, enableTestAccount = false) {
    this.host = config.host;
    this.port = Number(config.port);
    this.user = config.user;
    this.password = config.password;
    this.secure = config.secure;
    this.enableTestAccount = enableTestAccount;
  }

  async createTransport() {
    let mailAccount: EmailAccount;
    if (this.user && this.password) {
      mailAccount = {
        user: this.user,
        pass: this.password,
      };
    } else if (this.enableTestAccount === true) {
      mailAccount = await nodemailer.createTestAccount();
      this.host = 'smtp.ethereal.email';
      this.port = 587;
    } else {
      throw new Error('Email credentials are required');
    }

    return nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: mailAccount,
    });
  }

  async send(message: string, options: EmailOptions) {
    const transporter = await this.createTransport();
    const { senderName, senderEmail, subject, recipient } = options || {};
    const emailData = {
      to: recipient,
      from: senderName ? `${senderName} <${senderEmail}>` : senderEmail,
      subject: subject,
      html: message,
    };
    try {
      const info = await transporter.sendMail(emailData);
      console.log(`Message sent: ${info.messageId}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
