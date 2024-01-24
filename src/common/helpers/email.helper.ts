import { Injectable } from '@nestjs/common';
import { EmailBuilder } from '@app/queue/jobs/email.job';
import { Queue } from 'bull';
import { queues } from '@app/queue/config.queue';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailHelper {
  constructor(
    @InjectQueue(queues.notification.name) private notificationQueue: Queue
  ) {}

  async sendEmail(
    subject: string,
    templateName: string,
    recipients: string[],
    context: any
  ) {
    const emailJob = new EmailBuilder(subject, {
      templateName,
      context,
    })
      .addRecipients(recipients)
      .addSender({
        name: 'MentorsHub',
        email: 'hello@mentorshub.io',
      })
      .build();

    await this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }
}
