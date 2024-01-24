import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './subscriptions.schema';
import { MentorshipModule } from '../mentorship/mentorship.module';
import { SubscriptionPlansModule } from '../plans/subscriptionPlans.module';
import {
  SubscriptionPlans,
  SubscriptionPlansSchema,
} from '../plans/subscriptionPlans.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SubscriptionPlans.name,
        schema: SubscriptionPlansSchema,
      },
    ]),
    SubscriptionPlansModule,
    MentorshipModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
