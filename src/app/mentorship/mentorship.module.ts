import { Module } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Mentorship, MentorshipSchema } from './mentorship.schema';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { MentorshipGroupModule } from '../mentorship-group/mentorship-group.module';
import { EmailHelper } from '@app/common/helpers/email.helper';
import { BullModule } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Mentorship.name,
        schema: MentorshipSchema,
      },
    ]),

    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    UserModule,
    NotificationModule,
    MentorshipGroupModule,
  ],
  controllers: [MentorshipController],
  providers: [MentorshipService, EmailHelper],
  exports: [MentorshipService],
})
export class MentorshipModule {}
