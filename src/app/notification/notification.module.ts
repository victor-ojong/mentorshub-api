import { Module } from '@nestjs/common';
import { config } from '@app/config';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationQueueConsumer } from '@app/queue/processors/notification.consumer';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailModule } from './channels/email/email.module';
import { EmailService } from './channels/email/email.service';
import { InappService } from './channels/inapp/inapp.service';
import { InappModule } from './channels/inapp/inapp.module';
import { EMAIl_PROVIDERS } from '../../gateway/email/email.types';
import {
  Notification,
  NotificationSchema,
  OutboundNotification,
  OutboundNotificationSchema,
} from './notification.schema';

@Module({
  imports: [
    InappModule,
    EmailModule.forRoot({
      client: EMAIl_PROVIDERS.nodemailer,
      emailConfig: {
        host: config.email.host,
        user: config.email.user,
        password: config.email.password,
        port: config.email.port,
        secure: !!config.email.secure,
        apiKey: config.resendApiKey,
      },
      global: false,
    }),
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
      { name: OutboundNotification.name, schema: OutboundNotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: 'channels',
      useFactory: (email: EmailService, inApp: InappService) => {
        return {
          email,
          inApp,
        };
      },
      inject: [EmailService, InappService],
    },
    NotificationService,
    NotificationQueueConsumer,
  ],
  exports: [NotificationService, NotificationQueueConsumer],
})
export class NotificationModule {}
