import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MentorshipSession, MentorshipSessionSchema } from './session.schema';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { TwilioService } from '@app/gateway/email/providers/twilio/twilio.service';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';
import { EmailHelper } from '@app/common/helpers/email.helper';
import { AvailabilityModule } from '../availability/availability.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    AvailabilityModule,
    SubscriptionsModule,
    MongooseModule.forFeature([
      {
        name: MentorshipSession.name,
        schema: MentorshipSessionSchema,
      },
    ]),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    NotificationModule,
  ],
  controllers: [SessionController],
  providers: [SessionService, TwilioService, EmailHelper],
  exports: [SessionService],
})
export class SessionModule {}
