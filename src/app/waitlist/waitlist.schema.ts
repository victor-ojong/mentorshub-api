import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type WaitlistDocument = HydratedDocument<Waitlist>;

@Schema({ timestamps: true })
export class Waitlist {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.String,
    enum: {
      values: ['mentor', 'mentee'],
    },
  })
  accountType: 'mentor' | 'mentee';
}
export const WaitlistSchema = SchemaFactory.createForClass(Waitlist);
