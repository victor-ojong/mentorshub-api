import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoleGuard } from '@app/common/guards/rolesGuard/roles.guard';
import { UserWithId } from '@app/common/enum/RequestUser';
import { CreateSubscriptionPlansDto } from './dto/createSubscriptionPlans.dto';
import { UpdateSubscriptionPlansDto } from './dto/updateSubscriptionPlans.dto';
import { SubscriptionPlansService } from './subscriptionPlans.service';
import { Roles } from '@app/common/guards/rolesGuard/roles.decorator';
import { AccountType } from '@app/common/enum/AccountType';
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(
    private readonly subscriptionPlansService: SubscriptionPlansService
  ) {}

  @Roles(AccountType.MENTOR)
  @Post()
  async createPlan(
    @Body() createSubscriptionPlanDto: CreateSubscriptionPlansDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as UserWithId;
    return await this.subscriptionPlansService.createPlan({
      ...createSubscriptionPlanDto,
      mentorId: user._id.toString(),
    });
  }

  @Get()
  async getPlans(@Request() req: ExpressRequest) {
    const user = req.user as UserWithId;
    return await this.subscriptionPlansService.findPlanByMentorId(
      user._id.toString()
    );
  }

  @Get(':id')
  async getPlansById(@Param('id') mentorId: string) {
    return await this.subscriptionPlansService.findPlanByMentorId(mentorId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(AccountType.MENTOR)
  @Patch(':id')
  async updatePlan(
    @Body() updateSubscriptionPlansDto: UpdateSubscriptionPlansDto,
    @Param('id') subscriptionPlanId: string,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as UserWithId;
    return await this.subscriptionPlansService.updatePlan(
      subscriptionPlanId,
      updateSubscriptionPlansDto,
      user._id.toString()
    );
  }
}
