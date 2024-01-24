import {
  BadRequestException,
  Injectable,
  Logger,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from './subscriptions.schema';
import { MentorshipService } from '../mentorship/mentorship.service';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { SubscriptionPlansService } from '../plans/subscriptionPlans.service';
import { SubscriptionPlansStatus } from '@app/common/enum/SubscriptionPlanStatus';
import { SubscriptionStatus } from '@app/common/enum/subscriptionStatus';
import { getDueDatesFromDuration } from '@app/common/functions/getDueDateFromDuration';
import { printObject } from '@app/lib/utils.lib';

@Injectable()
export class SubscriptionsService {
  private logger = new Logger(SubscriptionsService.name);
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly mentorshipService: MentorshipService,
    private readonly subscriptionPlansService: SubscriptionPlansService
  ) {}

  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    menteeId: string
  ) {
    // TODO: process the payment before proceeding
    this.logger.log(
      `subscription request from ${menteeId}, ${printObject(
        createSubscriptionDto
      )}`
    );
    const { planId, mentorId, proficiencyLevel, growthAreas } =
      createSubscriptionDto;

    this.logger.log(
      `finding one subscriptionPlan ${menteeId}, ${printObject(
        createSubscriptionDto
      )}`
    );
    const subscriptionPlan = await this.subscriptionPlansService.findOne({
      _id: planId,
      status: SubscriptionPlansStatus.PUBLISHED,
      mentor: mentorId,
    });

    if (!subscriptionPlan) {
      this.logger.log(
        `No Publised subscription plan for the provided mentorId: ${createSubscriptionDto.mentorId} and planId ${createSubscriptionDto.planId}`
      );
      throw new BadRequestException(
        `No Publised subscription plan for the provided mentorId: ${createSubscriptionDto.mentorId} and planId ${createSubscriptionDto.planId}`
      );
    }

    if (subscriptionPlan.usedSlot >= subscriptionPlan.slot) {
      this.logger.log(
        `subscription plan does not have available slot, Plan: ${createSubscriptionDto.planId}`
      );
      throw new BadRequestException(
        `subscription plan does not have available slot, Plan: ${createSubscriptionDto.planId}`
      );
    }

    const mentorship = await this.mentorshipService.create({
      mentorId,
      menteeId,
      proficiencyLevel,
      growthAreas,
    });

    if (!mentorship) {
      // if mentee has been billed, then a reversal should be triggered here, or a billing dispute should be recorded.
      this.logger.log(
        'Subscription could not be activated, due to an error while creating mentorship'
      );
      throw new PreconditionFailedException(
        'Subscription could not be activated. Ensure to provide a valid data'
      );
    }

    this.logger.log(
      `Creating subscription, mentee: ${menteeId}, ${printObject(
        createSubscriptionDto
      )}`
    );
    const subscription = await this.subscriptionModel.create({
      planType: subscriptionPlan.type,
      amountPaid: subscriptionPlan.amount,
      planId: subscriptionPlan._id,
      status: SubscriptionStatus.ACTIVE,
      mentorship: mentorship._id.toString(),
      endDate: getDueDatesFromDuration(subscriptionPlan.duration),
      sessionCount: subscriptionPlan.sessionCount,
      mentor: mentorId,
      mentee: menteeId,
    });

    this.logger.log(
      `Subscription ${printObject(
        subscription
      )} from , mentee: ${menteeId}, ${printObject(createSubscriptionDto)}`
    );

    this.logger.log(`Updating the used slot of subscription plan ${planId}`);
    await this.subscriptionPlansService.findByIdAndUpdate(
      subscriptionPlan._id,
      {
        usedSlot: subscriptionPlan.usedSlot + 1,
      }
    );

    return subscription;
  }

  async findOne(payload: FilterQuery<SubscriptionDocument>) {
    return await this.subscriptionModel.findOne(payload);
  }

  async findOneAndUpdate(
    filter: FilterQuery<SubscriptionDocument>,
    update: FilterQuery<SubscriptionDocument>
  ) {
    return await this.subscriptionModel.findOneAndUpdate(filter, update);
  }
}
