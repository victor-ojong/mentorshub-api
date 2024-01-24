import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationPayload } from '../../app/notification/notification.type';
import { NotificationService } from '../../app/notification/notification.service';

import { queues } from '../config.queue';

@Processor(queues.notification.name)
export class NotificationQueueConsumer {
  constructor(private notificationService: NotificationService) {}

  @Process(queues.notification.email.name)
  async sendEmail(job: Job<NotificationPayload>) {
    await this.notificationService.send(job.data);
  }

  @Process(queues.notification.inApp.name)
  sendInapp(job: Job<NotificationPayload>) {
    this.notificationService.send(job.data);
  }
}
