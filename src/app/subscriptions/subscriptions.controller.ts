import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { UserWithId } from '@app/common/enum/RequestUser';
import { SubscriptionsService } from './subscriptions.service';

@UseGuards(JwtAuthGuard)
@Controller('')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post('subscribe')
  async subsctibe(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as UserWithId;

    return await this.subscriptionService.createSubscription(
      createSubscriptionDto,
      user._id.toString()
    );
  }
}
