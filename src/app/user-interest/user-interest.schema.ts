import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Interest, InterestDocument } from '../interest/interest.schema';
import { User, UserDocument } from '../user/user.schema';

export type UserInterestDocument = HydratedDocument<UserInterest>;

@Schema({ timestamps: true })
export class UserInterest {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interest',
  })
  interest: string | mongoose.Types.ObjectId | Interest | InterestDocument;
}

export const UserInterestSchema = SchemaFactory.createForClass(UserInterest);
UserInterestSchema.index({ user: 1, interest: 1 }, { unique: true });
