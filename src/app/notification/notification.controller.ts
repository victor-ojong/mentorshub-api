import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindNotificationDto } from './dto/find-notification.dto';
import { NotificationService } from './notification.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notifications')
  @ApiOperation({
    summary: 'Send a notification',
    description: 'Send a notification to the specified recipients.',
  })
  @ApiOkResponse({ description: 'Notification sent successfully' })
  @ApiBadRequestResponse({
    description: 'Invalid request or missing required fields',
  })
  @ApiBody({ type: CreateNotificationDto })
  async send(@Body() body: CreateNotificationDto) {
    await this.notificationService.send({
      title: body.title,
      content: body.content,
      from: body.from,
      metadata: body.from,
      to: body.to
        ? body.to.map((m) => ({
            ...m,
            recipient: {
              ...m.recipient,
              userIds: [m.recipient.userId],
              deviceIds: [m.recipient.deviceId],
            },
          }))
        : [],
    });
    return { success: true, message: 'message sent' };
  }

  @Get('users/:id/inapp-notifications')
  @ApiOperation({
    summary: 'Find in-app notifications for a user',
    description: 'Retrieve in-app notifications for the specified user.',
  })
  @ApiOkResponse({ description: 'In-app notifications found successfully' })
  @ApiNotFoundResponse({
    description: 'User not found or no in-app notifications available',
  })
  @ApiQuery({ type: FindNotificationDto })
  @ApiParam({
    type: String,
    name: 'id',
  })
  findInAppNotifications(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query() query: FindNotificationDto
  ) {
    return this.notificationService.findInAppNotifications(userId, query);
  }

  @Patch('users/:userId/inapp-notifications/:inappNotificationId')
  @ApiOperation({
    summary: 'Mark In-App Notification as Read',
    description: 'Marks a specific in-app notification as read for a user.',
  })
  @ApiResponse({
    status: 200,
    description: 'In-App Notification marked as read.',
  })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID (UUID)' })
  @ApiParam({
    name: 'inappNotificationId',
    type: 'string',
    description: 'In-App Notification ID (UUID)',
  })
  read(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('inappNotificationId', ParseUUIDPipe) inappNotificationId: string
  ) {
    return this.notificationService.readInapp({ userId, inappNotificationId });
  }

  @Patch('users/:userId/inapp-notifications')
  @ApiOperation({
    summary: 'Mark All In-App Notifications as Read',
    description: 'Marks all in-app notifications as read for a specific user.',
  })
  @ApiResponse({
    status: 200,
    description: 'All In-App Notifications marked as read.',
  })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  readAll(@Param('userId') userId: string) {
    return this.notificationService.readAllInapp(userId);
  }
}
