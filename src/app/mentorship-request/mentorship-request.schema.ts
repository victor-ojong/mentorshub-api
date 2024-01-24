import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  MentorshipGroup,
  MentorshipGroupDocument,
} from '../mentorship-group/mentorship-group.schema';
import {
  Mentorship,
  MentorshipDocument,
} from '../mentorship/mentorship.schema';
import { User, UserDocument } from '../user/user.schema';
import { MenteeProficiency } from '@app/common/enum/MenteeProficiency';

export type MentorshipRequestDocument = HydratedDocument<MentorshipRequest>;

export enum MentorshipRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class MentorshipRequest {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentee: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    default: MentorshipRequestStatus.PENDING,
    required: true,
    enum: [
      MentorshipRequestStatus.PENDING,
      MentorshipRequestStatus.ACCEPTED,
      MentorshipRequestStatus.REJECTED,
      MentorshipRequestStatus.CANCELLED,
    ],
  })
  acceptanceStatus: MentorshipRequestStatus;

  @Prop({
    default: MentorshipRequestStatus.PENDING,
    required: true,
    enum: [
      MentorshipRequestStatus.PENDING,
      MentorshipRequestStatus.ACCEPTED,
      MentorshipRequestStatus.REJECTED,
      MentorshipRequestStatus.CANCELLED,
    ],
  })
  confirmationStatus: MentorshipRequestStatus;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentorship',
  })
  mentorship?:
    | string
    | mongoose.Types.ObjectId
    | Mentorship
    | MentorshipDocument;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipGroup',
  })
  mentorshipGroup?:
    | string
    | mongoose.Types.ObjectId
    | MentorshipGroup
    | MentorshipGroupDocument;

  @Prop({
    required: true,
    enum: MenteeProficiency,
  })
  proficiencyLevel: MenteeProficiency;

  @Prop({
    required: true,
    type: String,
  })
  growthAreas: string;
}

export const MentorshipRequestSchema =
  SchemaFactory.createForClass(MentorshipRequest);
