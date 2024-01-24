import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

export enum Gender {
  male = 'male',
  female = 'female',
  other = 'other',
}

@Schema({ timestamps: true })
export class User {
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

  @Prop({ required: false, enum: [Gender.male, Gender.female, Gender.other] })
  gender?: Gender;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  emailVerifiedAt: Date;

  @Prop({ required: false, type: [mongoose.Schema.Types.String] })
  socialUrls?: string[];

  @Prop({ required: false })
  jobTitle?: string;

  @Prop({ required: false })
  industry?: string;

  @Prop({ required: false })
  careerSummary?: string;

  @Prop({ required: false, type: [mongoose.Schema.Types.String] })
  stack?: string[];

  @Prop({ required: false, type: [mongoose.Schema.Types.String] })
  tools?: string[];

  @Prop({ required: false, type: [mongoose.Schema.Types.String] })
  interestedTools?: string[];

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ required: false })
  techTrack?: string;

  @Prop({ required: false })
  timeZone?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  yearsOfExperience?: string;

  @Prop({ required: false })
  learningPeriod?: string;

  @Prop({ required: false })
  company?: string;

  @Prop({ required: false })
  shortSummary?: string;

  @Prop({
    required: false,
    default: {
      emailNotification: true,
      inAppNotification: true,
    },
    type: {
      emailNotification: Boolean,
      inAppNotification: Boolean,
    },
    _id: false,
  })
  meetingsReminders?: {
    emailNotification: boolean;
    inAppNotification: boolean;
  };

  @Prop({
    required: false,
    default: {
      emailNotification: true,
      inAppNotification: true,
    },
    type: {
      emailNotification: Boolean,
      inAppNotification: Boolean,
    },
    _id: false,
  })
  updatesReminders?: {
    emailNotification: boolean;
    inAppNotification: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return { ...ret, id: ret._id };
  },
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.password;
    return { ...ret, id: ret._id };
  },
});
