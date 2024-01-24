import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InterestDocument = HydratedDocument<Interest>;

@Schema({ timestamps: true })
export class Interest {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);
