import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  taskId: string | mongoose.Types.ObjectId;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
