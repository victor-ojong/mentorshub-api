import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { printObject } from '../../lib/utils.lib';
import { queues } from '../../queue/config.queue';
import { EmailJob } from '../../queue/jobs/email.job';
import { OtpService } from '../otp/otp.service';
import { User } from '../user/user.schema';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectQueue(queues.notification.name) private notificationQueue: Queue,
    private otpService: OtpService
  ) {}

  initiateEmailVerification(user: User) {
    this.logger.log(
      `initializing email verification - object - ${printObject(user)}`
    );
    const { reference, token, tokenTTLSeconds } =
      this.generateVerificationToken(user);
    return { reference, ttlSeconds: tokenTTLSeconds, token };
  }

  sendEmailVerificationNotification(
    user: User,
    reference: string,
    token: string
  ) {
    this.logger.log(
      `sending email verification - user ${printObject(
        user
      )} - reference ${reference} - token ${token}`
    );
    const emailJob = new EmailJob({
      subject: 'Email Verification',
      body: {
        templateName: 'otp',
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: 'MentorsHub',
      context: { token, reference, email: user.email },
      recipients: [user.email],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }

  private generateVerificationToken(user: User & { id?: string }) {
    return this.otpService.generateOtpToken(user.id);
  }

  verifyAccount(ref: string, token?: string) {
    return this.otpService.verifyToken(ref, token);
  }
}
