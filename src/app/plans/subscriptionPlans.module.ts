import { Module } from '@nestjs/common';
import { SubscriptionPlansController } from './subscriptionPlans.controller';
import { SubscriptionPlansService } from './subscriptionPlans.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubscriptionPlans,
  SubscriptionPlansSchema,
} from './subscriptionPlans.schema';
import { AvailabilityModule } from '../availability/availability.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SubscriptionPlans.name,
        schema: SubscriptionPlansSchema,
      },
    ]),
    AvailabilityModule,
  ],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService],
})
export class SubscriptionPlansModule {}
