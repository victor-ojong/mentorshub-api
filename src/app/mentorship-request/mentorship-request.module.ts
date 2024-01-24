import { Module } from '@nestjs/common';
import { MentorshipRequestService } from './mentorship-request.service';
import { MentorshipRequestController } from './mentorship-request.controller';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MentorshipRequest,
  MentorshipRequestSchema,
} from './mentorship-request.schema';
import { BullModule } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';
import { NotificationModule } from '../notification/notification.module';
import { MentorshipGroupModule } from '../mentorship-group/mentorship-group.module';
import { EmailHelper } from '../../common/helpers/email.helper';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: MentorshipRequest.name,
        schema: MentorshipRequestSchema,
      },
    ]),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    NotificationModule,
    MentorshipGroupModule,
  ],
  controllers: [MentorshipRequestController],
  providers: [MentorshipRequestService, EmailHelper],
  exports: [MentorshipRequestService],
})
export class MentorshipRequestModule {}
