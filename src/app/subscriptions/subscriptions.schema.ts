import { SubscriptionPlanTypes } from '@app/common/enum/SubscriptionPlanTypes';
import { SubscriptionStatus } from '@app/common/enum/subscriptionStatus';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ enum: SubscriptionPlanTypes, required: true })
  planType: SubscriptionPlanTypes;

  @Prop({ type: Number, required: true })
  amountPaid: number;

  @Prop({ type: Number, required: true })
  sessionCount: number;

  @Prop({ type: Number, default: 0 })
  usedSessionCount: number;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ type: String, required: true })
  planId: string;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  mentorship: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  mentor: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  mentee: mongoose.Types.ObjectId;

  @Prop({ type: Date, required: true })
  endDate: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
