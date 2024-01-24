import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Boolean, default: false })
  isCompleted?: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
