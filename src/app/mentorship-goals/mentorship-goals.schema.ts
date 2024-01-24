import { GoalStatus } from '@app/common/enum/GoalStatus';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import {
  Mentorship,
  MentorshipDocument,
} from '../mentorship/mentorship.schema';
import { ALLOWEDTASKCOUNT } from '@app/common/enum/TaskStatus';

export type MentorshipGoalDocument = HydratedDocument<MentorshipGoal>;

@Schema({ timestamps: true })
export class MentorshipGoal {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: false,
    type: Date,
  })
  dueDate: Date;

  @Prop({
    enum: GoalStatus,
    default: GoalStatus.ONGOING,
  })
  status: GoalStatus;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    validate: {
      validator: function (value) {
        console.log({ value });
        return value.length <= ALLOWEDTASKCOUNT;
      },
      message: 'You have reached maximum number of Task for this Goal',
    },
  })
  task: mongoose.Types.ObjectId[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentee: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentorship',
  })
  mentorshipId:
    | string
    | mongoose.Types.ObjectId
    | Mentorship
    | MentorshipDocument;
}

export const MentorshipGoalSchema =
  SchemaFactory.createForClass(MentorshipGoal);
