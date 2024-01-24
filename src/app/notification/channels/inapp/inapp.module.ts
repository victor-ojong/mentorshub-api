import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  InappNotification,
  InappNotificationSchema,
} from './inapp-notification.schema';
import { InappService } from './inapp.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InappNotification.name,
        schema: InappNotificationSchema,
      },
    ]),
  ],
  providers: [InappService],
  exports: [InappService],
})
export class InappModule {}
