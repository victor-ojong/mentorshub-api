import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SubscriptionPlanDocument,
  SubscriptionPlans,
} from './subscriptionPlans.schema';
import { CreateSubscriptionPlansDto } from './dto/createSubscriptionPlans.dto';
import { AvailabilityService } from '../availability/availability.service';
import { UpdateSubscriptionPlansDto } from './dto/updateSubscriptionPlans.dto';
import { SubscriptionPlanTypes } from '@app/common/enum/SubscriptionPlanTypes';
import { printObject } from '@app/lib/utils.lib';

@Injectable()
export class SubscriptionPlansService {
  logger = new Logger(SubscriptionPlansService.name);

  constructor(
    @InjectModel(SubscriptionPlans.name)
    private readonly subscriptionPlanModel: Model<SubscriptionPlanDocument>,
    private readonly availabilityService: AvailabilityService
  ) {}

  async createPlan(payload: CreateSubscriptionPlansDto & { mentorId: string }) {
    this.logger.log(`creating plan ${payload}`);
    // check if the plan exist for the mentor
    const existingPlans = await this.findPlanByMentorId(payload.mentorId);

    const newPlanType = payload?.type ?? SubscriptionPlanTypes.BASIC;

    if (existingPlans.some((plan) => plan.type == newPlanType)) {
      this.logger.log(
        `Plan can not be created, ${newPlanType} plan already exist`
      );
      throw new BadRequestException(
        `Plan can not be created, ${newPlanType} plan already exist`
      );
    }

    await this.checkSlotAvailability(
      payload.mentorId,
      existingPlans,
      payload.slot
    );

    this.validateSessionCount(existingPlans, newPlanType, payload.sessionCount);

    const result = await this.subscriptionPlanModel.create({
      type: payload.type,
      amount: payload.amount,
      duration: payload.duration,
      description: payload.description,
      slot: payload.slot,
      mentor: payload.mentorId,
      sessionCount: payload.sessionCount,
    });

    return result;
  }

  async findPlanByMentorId(mentorId: string) {
    this.logger.log(`fetching all plans for mentor ${mentorId}`);
    return await this.subscriptionPlanModel.find({ mentor: mentorId });
  }

  async updatePlan(
    planId: string,
    updateSubscriptionPlansDto: UpdateSubscriptionPlansDto,
    mentorId: string
  ) {
    let existingPlans: SubscriptionPlanDocument[];
    if (updateSubscriptionPlansDto.slot) {
      existingPlans = await this.findPlanByMentorId(mentorId);
      await this.checkSlotAvailability(
        mentorId,
        existingPlans.filter((plan) => !plan._id.equals(planId)), // remove the plan to be updated from existing plan, this is necessary to get the accurate number of slots
        updateSubscriptionPlansDto.slot
      );
    }

    if (updateSubscriptionPlansDto.sessionCount) {
      existingPlans =
        existingPlans ?? (await this.findPlanByMentorId(mentorId));
      const planTobeUpdated = existingPlans.find((plan) =>
        plan._id.equals(planId)
      );

      // validateSessionCount ensures that sessionCount for each plan type is in right proportion
      // for instance, session count of basic plan should not be more than that of standard plan.
      this.validateSessionCount(
        existingPlans,
        planTobeUpdated?.type,
        updateSubscriptionPlansDto.sessionCount
      );
    }

    this.logger.log(
      `updating subscriptionPlan ${printObject(
        updateSubscriptionPlansDto
      )}, planId: ${planId}`
    );

    const updatedPlan = await this.subscriptionPlanModel.findOneAndUpdate(
      { _id: planId, mentor: mentorId },
      {
        slot: updateSubscriptionPlansDto.slot,
        amount: updateSubscriptionPlansDto.amount,
        description: updateSubscriptionPlansDto.description,
        status: updateSubscriptionPlansDto.status,
        duration: updateSubscriptionPlansDto.duration,
        sessionCount: updateSubscriptionPlansDto.sessionCount,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      this.logger.log(
        `subscriptionPlan not found ${printObject(
          updateSubscriptionPlansDto
        )}, planId: ${planId}`
      );
      throw new NotFoundException('Plan not found');
    }

    return updatedPlan;
  }

  async findOne(query: unknown) {
    return await this.subscriptionPlanModel.findOne(query);
  }

  async findByIdAndUpdate(
    id: mongoose.Types.ObjectId,
    update: Partial<SubscriptionPlanDocument>
  ) {
    return await this.subscriptionPlanModel.findByIdAndUpdate(id, update);
  }
  private async checkSlotAvailability(
    mentorId: string,
    existingPlans: SubscriptionPlanDocument[],
    newPlanSlot: number
  ) {
    /* 
        checkSlotAvailability: ensures that the total slots of all 
        plans does not exceed the available slot of the mentor.
     */

    this.logger.log(`checking if slot is available for mentor ${mentorId}`);
    // fetch mentor's availability to get the assigned available slot
    const mentorAvailability = await this.availabilityService.findOneByMentorId(
      mentorId
    );

    if (!mentorAvailability) {
      this.logger.log(`Availability does not exist for mentor ${mentorId}`);
      throw new NotFoundException(
        `Availability does not exist for mentor ${mentorId}, please create your availability`
      );
    }

    const mentorAvailableSlot = mentorAvailability.availableSlots;

    // accumulate existing plans slots
    const existingPlansSlots = existingPlans.reduce((prev, curr) => {
      return prev + curr.slot;
    }, 0);

    this.logger.log(
      `checking if total slots of all plans is not more than the available slot for mentor ${mentorId}`
    );
    if (existingPlansSlots + newPlanSlot > mentorAvailableSlot) {
      this.logger.log(
        `Not enough slot to create plan. Cummulative slots of all plans should not be more than mentor's available slot, mentor: ${mentorId}`
      );
      throw new BadRequestException(
        `Not enough slot to create plan. Cummulative slots of all plans should not be more than mentor's available slot`
      );
    }

    this.logger.log(`mentor: ${mentorId} has enough slots`);
    return true;
  }

  private validateSessionCount(
    existingPlans: SubscriptionPlanDocument[],
    incomingSubscriptionPlanType: SubscriptionPlanTypes,
    sessionCount: number
  ) {
    // validateSessionCount ensures that sessionCount for each plan type is in right proportion
    // for instance, session count of basic plan should not be more than that of standard plan.
    if (incomingSubscriptionPlanType === SubscriptionPlanTypes.BASIC) {
      const standardPlan = existingPlans.find(
        (plan) => plan.type === SubscriptionPlanTypes.STANDARD
      );

      if (standardPlan && standardPlan.sessionCount <= sessionCount) {
        this.logger.log(
          'Session count for basic plan must be less than that of standard plan'
        );
        throw new BadRequestException(
          'Session count for basic plan must be less than that of standard plan'
        );
      }
    }

    if (incomingSubscriptionPlanType === SubscriptionPlanTypes.STANDARD) {
      const basicPlan = existingPlans.find(
        (plan) => plan.type === SubscriptionPlanTypes.BASIC
      );

      if (basicPlan && basicPlan.sessionCount >= sessionCount) {
        this.logger.log(
          'Session count for standard plan must be more than that of  basic plan'
        );
        throw new BadRequestException(
          'Session count for standard plan must be more than that of basic plan'
        );
      }
    }
  }
}
