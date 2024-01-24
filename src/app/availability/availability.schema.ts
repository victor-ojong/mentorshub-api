import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import mongoose, { HydratedDocument } from 'mongoose';

export type AvailabilityDocument = HydratedDocument<Availability>;
@Schema({ timestamps: true })
export class Availability {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  mentorId: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    required: false,
    type: [{ date: { type: String }, time: { type: [String] } }],
    _id: false,
  })
  availableDates?: { date: string; time: string[] }[];

  @Prop({ required: false, type: Number, default: 4 })
  availableSlots?: number;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
