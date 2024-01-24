import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import {
  InappNotification,
  InappNotificationDocument,
} from './channels/inapp/inapp-notification.schema';

export enum DeliveryStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export type NotificationDocument = HydratedDocument<Notification>;
export type OutboundNotificationDocument =
  HydratedDocument<OutboundNotification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InappNotification' }],
  })
  inappNotifications?: (
    | string
    | mongoose.Types.ObjectId
    | InappNotificationDocument
    | InappNotification
  )[];

  @Prop({
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'OutboundNotification' },
    ],
  })
  outboundNotifications?: (
    | string
    | mongoose.Types.ObjectId
    | OutboundNotificationDocument
    | OutboundNotification
  )[];
}

@Schema({
  timestamps: true,
})
export class OutboundNotification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  notification:
    | string
    | mongoose.Types.ObjectId
    | NotificationDocument
    | Notification;

  @Prop()
  channel: string;

  @Prop({
    default: DeliveryStatus.PENDING,
    required: true,
    enum: [
      DeliveryStatus.FAILED,
      DeliveryStatus.PENDING,
      DeliveryStatus.SUCCESSFUL,
    ],
  })
  status: DeliveryStatus;

  @Prop({ default: 0, required: true })
  retryCount: number;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  sender?: Record<string, any>;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  recipient: Record<string, any>;

  @Prop({ required: false })
  template?: string;

  @Prop({ required: false, type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export const OutboundNotificationSchema =
  SchemaFactory.createForClass(OutboundNotification);

OutboundNotificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    return { ...ret, id: ret._id };
  },
});

OutboundNotificationSchema.set('toObject', {
  transform: (doc, ret) => {
    return { ...ret, id: ret._id };
  },
});

NotificationSchema.set('toObject', {
  transform: (doc, ret) => {
    return { ...ret, id: ret._id };
  },
});

NotificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    return { ...ret, id: ret._id };
  },
});
