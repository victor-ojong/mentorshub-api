import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';

export type MentorshipSessionDocument = HydratedDocument<MentorshipSession>;
export enum MentorshipSessionStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}
@Schema({ timestamps: true })
export class MentorshipSession {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  menteeId: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentorId: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    required: false,
    type: [{ date: { type: String }, time: { type: String } }],
    _id: false,
  })
  date: { date: string; time: string }[];

  @Prop({ required: false, default: false })
  roomName: string;

  @Prop({ required: false, default: false })
  token: string;

  @Prop({
    required: true,
    default: MentorshipSessionStatus.SCHEDULED,
    enum: [
      MentorshipSessionStatus.SCHEDULED,
      MentorshipSessionStatus.CONFIRMED,
    ],
  })
  status: MentorshipSessionStatus;
}
export const MentorshipSessionSchema =
  SchemaFactory.createForClass(MentorshipSession);

MentorshipSessionSchema.set('toJSON', {
  transform: (doc, ret) => {
    return { ...ret, id: ret._id };
  },
});
