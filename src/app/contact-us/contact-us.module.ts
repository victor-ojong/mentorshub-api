import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { BullModule } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    NotificationModule,
  ],

  providers: [ContactUsService],
  controllers: [ContactUsController],
  exports: [ContactUsService],
})
export class ContactUsModule {}
