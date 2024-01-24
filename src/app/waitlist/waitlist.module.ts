import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Waitlist, WaitlistSchema } from './waitlist.schema';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Waitlist.name, schema: WaitlistSchema },
    ]),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    NotificationModule,
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
