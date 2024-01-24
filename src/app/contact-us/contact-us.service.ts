import { Injectable } from '@nestjs/common';
import { ContactUsDto } from './dto/contact-us.dto';
import { EmailJob } from '@app/queue/jobs/email.job';
import { InjectQueue } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';
import { Queue } from 'bull';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectQueue(queues.notification.name)
    private notificationQueue: Queue
  ) {}

  ContactUs(ContactUsDto: ContactUsDto) {
    this.sendContactUsMail(ContactUsDto);
    return { success: true };
  }
  sendContactUsMail(user: ContactUsDto) {
    const emailJob = new EmailJob({
      subject: user.messageTitle,
      body: {
        templateName: 'contact-us',
        content: user.message,
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: user.firstName + ' ' + user.lastName,
      context: {
        firstName: user.firstName,
        lastName: user.lastName,
        messageTitle: user.messageTitle,
        message: user.message,
        email: user.email,
      },
      recipients: ['pius@mentored.pro'],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }
}
