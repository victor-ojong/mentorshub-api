import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { FilterQuery, Model } from 'mongoose';

import { PaginatedResult, Pagination } from '../../../../lib/pagination.lib';
import {
  buildEntitySortObjectFromQueryParam,
  printObject,
} from '../../../../lib/utils.lib';
import { FindNotificationDto } from '../../dto/find-notification.dto';
import { Notification, OutboundNotification } from '../../notification.schema';
import {
  NotificationChannel,
  NotificationPayload,
  Recipient,
} from '../../notification.type';
import { InappNotification } from './inapp-notification.schema';

@Injectable()
export class InappService extends NotificationChannel {
  logger = new Logger(InappService.name);

  constructor(
    @InjectModel(InappNotification.name)
    private inappNotificationModel: Model<InappNotification>
  ) {
    super();
  }

  async send(recipient: Recipient, payload: NotificationPayload) {
    for (const userId of recipient.userIds) {
      (
        await this.inappNotificationModel.create({
          notificationId: payload.notificationId,
          userId,
        })
      ).toObject();
    }
  }

  async find(userId: string, query: FindNotificationDto) {
    this.logger.log('fetching inapp notification for user with Id', userId);
    const { page, perPage, sort, isRead, ...rest } = query || {};
    const paginationOptions = new Pagination(page, perPage);

    if (String(isRead).toLowerCase() === 'false') {
      (rest as FilterQuery<InappNotification>).readAt = null;
    } else if (String(isRead).toLowerCase() === 'true') {
      (rest as FilterQuery<InappNotification>).readAt = {};
    }

    const queryObj: FilterQuery<InappNotification> = {
      ...rest,
      userId,
    };

    const resultPromise = this.inappNotificationModel
      .find({
        ...queryObj,
      })
      .populate('notification.outboundNotifications')
      .skip(paginationOptions.skip)
      .limit(paginationOptions.perPage);

    if (sort) {
      resultPromise.sort(buildEntitySortObjectFromQueryParam(sort));
    } else {
      resultPromise.sort({ createdAt: 'desc' });
    }

    const totalPromise = this.inappNotificationModel.countDocuments(queryObj);
    if (sort) {
      query;
    }

    const [result, total] = await Promise.all([resultPromise, totalPromise]);

    this.logger.log(
      `Find - Found paginated inapp notifications - ${printObject({
        result,
        total,
      })}`
    );
    return PaginatedResult.create(
      result
        ? result.map((r) => {
            const obj = r.toObject();
            const notification = obj.notification as Notification;
            return {
              ...r,
              notification: {
                title: notification.title,
                content: notification.content,
                metadata: (
                  notification.outboundNotifications as OutboundNotification[]
                )?.find(
                  (n) =>
                    n.channel === 'inApp' &&
                    (n.recipient.userIds as string[]).includes(userId)
                )?.metadata,
              },
            };
          })
        : [],
      total,
      paginationOptions
    );
  }

  async read(params: { userId: string; inappNotificationId: string }) {
    await this.inappNotificationModel.findOneAndUpdate(
      { id: params.inappNotificationId, userId: params.userId },
      { readAt: moment().toDate() }
    );
    return { success: true, message: 'notification read' };
  }

  async readAll(userId: string) {
    await this.inappNotificationModel.findOneAndUpdate(
      { userId },
      { readAt: moment().toDate() }
    );
    return { success: true, message: 'notification read' };
  }
}
