import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {
  Mentorship,
  MentorshipDocument,
} from '../mentorship/mentorship.schema';
import { User, UserDocument } from '../user/user.schema';

export type MentorshipGroupDocument = HydratedDocument<MentorshipGroup>;

@Schema({ timestamps: true })
export class MentorshipGroup {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentee: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

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
}

export const MentorshipGroupSchema =
  SchemaFactory.createForClass(MentorshipGroup);
