import { TaskStatus } from '@app/common/enum/TaskStatus';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { IDuration } from '@app/common/functions/getDueDateFromDuration';
import { Todo, TodoSchema } from './todo.schema';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    type: Date,
  })
  dueDate: Date;

  @Prop({
    required: true,
    type: String,
  })
  duration: IDuration;

  @Prop({
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status: TaskStatus;

  @Prop({ type: [TodoSchema] })
  todos: Todo[];

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentee: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipGoal',
  })
  mentorshipGoalId: string | mongoose.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
