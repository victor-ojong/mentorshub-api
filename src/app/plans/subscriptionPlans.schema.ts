import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { SubscriptionPlanTypes } from '@app/common/enum/SubscriptionPlanTypes';
import { IDuration } from '@app/common/functions/getDueDateFromDuration';
import { SubscriptionPlansStatus } from '@app/common/enum/SubscriptionPlanStatus';

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlans>;

@Schema({ timestamps: true })
export class SubscriptionPlans {
  @Prop({ enum: SubscriptionPlanTypes, default: SubscriptionPlanTypes.BASIC })
  type: SubscriptionPlanTypes;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: false,
    type: String,
    default: '1m',
  })
  duration: IDuration;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ type: Number, default: 0 })
  slot: number;

  @Prop({ type: Number, default: 0 })
  usedSlot: number;

  @Prop({
    enum: SubscriptionPlansStatus,
    default: SubscriptionPlansStatus.DRAFT,
  })
  status: SubscriptionPlansStatus;

  @Prop({ type: Number })
  sessionCount: number;
}

export const SubscriptionPlansSchema =
  SchemaFactory.createForClass(SubscriptionPlans);
