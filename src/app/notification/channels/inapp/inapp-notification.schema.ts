import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Notification, NotificationDocument } from '../../notification.schema';

export type InappNotificationDocument = HydratedDocument<InappNotification>;

@Schema({
  timestamps: true,
})
export class InappNotification {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  notification?:
    | string
    | mongoose.Types.ObjectId
    | NotificationDocument
    | Notification;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  user: string;

  @Prop({ nullable: true })
  readAt?: Date;
}

export const InappNotificationSchema =
  SchemaFactory.createForClass(InappNotification);
