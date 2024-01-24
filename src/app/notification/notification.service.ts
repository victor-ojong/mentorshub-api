import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  ChannelType,
  NotificationChannel,
  NotificationPayload,
} from './notification.type';
import { printObject } from '../../lib/utils.lib';
import { FindNotificationDto } from './dto/find-notification.dto';
import { InappService } from './channels/inapp/inapp.service';
import {
  DeliveryStatus,
  Notification,
  NotificationDocument,
  OutboundNotification,
  OutboundNotificationDocument,
} from './notification.schema';

@Injectable()
export class NotificationService {
  maxRetriesCount = 10;
  batchCount = 30;
  logger = new Logger(NotificationService.name);

  constructor(
    @Inject('channels')
    private channels: {
      [key in ChannelType]: NotificationChannel;
    },
    @InjectModel(OutboundNotification.name)
    private outboundNotificationModel: Model<OutboundNotification>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>
  ) {}

  async send(payload: NotificationPayload) {
    try {
      const outboudNotifications = await this.save(payload);
      await this.sendToChannels(outboudNotifications);
    } catch (error) {
      this.logger.error(`send - error sending notifications`, { error });
      throw error;
    }
  }

  protected async sendToChannels(
    outboundNotifications: OutboundNotification[]
  ) {
    this.logger.log(`sendToChannels -  sending notification`, {
      outboundNotifications,
    });
    if (outboundNotifications?.length) {
      for (const outboundNotification of outboundNotifications) {
        try {
          await this.channels[outboundNotification.channel as ChannelType].send(
            outboundNotification.recipient,
            {
              from: outboundNotification.sender,
              template: outboundNotification.template,
              title: (outboundNotification.notification as NotificationDocument)
                .title,
              content: (
                outboundNotification.notification as NotificationDocument
              ).content,
              metadata: outboundNotification.metadata,
              notificationId: (
                outboundNotification.notification as NotificationDocument
              ).id,
            }
          );
        } catch (error) {
          this.logger.debug(
            `error - could not send notification - ${printObject(error)}`
          );
          this.logFailedNotification(
            (outboundNotification as OutboundNotificationDocument).id
          );
        }
        this.logSuccessfulNotification(
          (outboundNotification as OutboundNotificationDocument).id
        );
      }
    }
  }

  protected async logFailedNotification(outboundNotificationId: string) {
    try {
      const notification = (
        await this.outboundNotificationModel.findById(outboundNotificationId)
      ).toObject();
      if (notification.status === DeliveryStatus.PENDING) {
        await this.outboundNotificationModel.findByIdAndUpdate(
          outboundNotificationId,
          { status: DeliveryStatus.FAILED }
        );
      } else if (notification.status === DeliveryStatus.FAILED) {
        await this.outboundNotificationModel.findByIdAndUpdate(
          outboundNotificationId,
          { retryCount: notification.retryCount + 1 }
        );
      }
    } catch (error) {
      this.logger.error(
        `logFailedNotification - error - ${printObject(error)}`
      );
    }
  }

  protected async logSuccessfulNotification(outboundNotificationId: string) {
    try {
      await this.outboundNotificationModel.findByIdAndUpdate(
        outboundNotificationId,
        { status: DeliveryStatus.SUCCESSFUL }
      );
    } catch (error) {
      this.logger.debug(
        `logSuccessfulNotification - error - ${printObject(error)}`
      );
    }
  }

  protected async save(payload: NotificationPayload) {
    this.logger.log(
      `save -  saving notification - payload ${printObject(payload)}`
    );
    const notification = new Notification();
    notification.title = payload.title;
    notification.content = payload.content || payload.template;
    let savedNotification: Notification & { id: string };

    try {
      savedNotification = (
        await this.notificationModel.create(notification)
      ).toObject();
    } catch (error) {
      this.logger.error(`save - error saving notification -`, error);
      throw error;
    }

    if (payload.to?.length) {
      const inserts = [];
      for (const recipientChannel of payload.to) {
        const outboundNotification = new OutboundNotification();
        outboundNotification.notification = (
          savedNotification as NotificationDocument
        )._id;
        outboundNotification.channel = recipientChannel.channel;
        outboundNotification.sender = payload.from[recipientChannel.channel];
        outboundNotification.recipient = recipientChannel.recipient;
        outboundNotification.template = payload.template || '';
        outboundNotification.metadata = payload.metadata;
        outboundNotification.retryCount = 10;
        const created = (
          await this.outboundNotificationModel.create(outboundNotification)
        ).toObject();
        inserts.push({ ...created, notification });
      }
      return inserts;
    }
  }

  protected async retryFailedNotifications() {
    const failedNotifications = await this.outboundNotificationModel
      .find({
        status: DeliveryStatus.FAILED,
        retryCount: { $lt: this.maxRetriesCount },
      })
      .limit(this.batchCount)
      .populate('notification');

    if (failedNotifications) {
      await this.sendToChannels(failedNotifications);
    }
  }

  async findInAppNotifications(userId: string, query: FindNotificationDto) {
    this.logger.log(
      `fetching inapp notification - ${printObject({ userId, ...query })}`
    );
    return await (this.channels.inApp as InappService).find(userId, query);
  }

  async readInapp(params: { userId: string; inappNotificationId: string }) {
    this.logger.log('reading with params', params);
    return await (this.channels.inApp as InappService).read(params);
  }

  async readAllInapp(userId: string) {
    this.logger.log("reading all user's inapp notifications - user Id", userId);
    return await (this.channels.inApp as InappService).readAll(userId);
  }
}
