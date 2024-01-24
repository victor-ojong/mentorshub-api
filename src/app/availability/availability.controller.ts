import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateOrUpdateAvailability } from './dto/create-or-update-availability';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoleGuard } from '@app/common/guards/rolesGuard/roles.guard';
import { Roles } from '@app/common/guards/rolesGuard/roles.decorator';
import { AccountType } from '@app/common/enum/AccountType';
import { UpdateAvailableDateDto } from './dto/updateAvailableDate';
import { UserWithId } from '@app/common/enum/RequestUser';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}
  @Roles(AccountType.MENTOR)
  @Post()
  async createOrUpdateAvailability(
    @Body() createOrUpdateAvailabilityDto: CreateOrUpdateAvailability,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    const mentorId = req.user._id;
    return await this.availabilityService.createOrUpdateAvailability({
      ...createOrUpdateAvailabilityDto,
      mentorId,
    });
  }

  @Put('/dates')
  async updateAvailableDate(
    @Body() updateAvailableDateDto: UpdateAvailableDateDto,
    @Request() req: ExpressRequest
  ) {
    const mentor = req.user as UserWithId;

    return await this.availabilityService.updateAvailableDates(
      updateAvailableDateDto,
      mentor._id.toString()
    );
  }

  @Get(':id')
  getAvailabilityByMentorId(@Param('id') mentorId: string) {
    console.log(mentorId);
    return this.availabilityService.findOneByMentorId(mentorId);
  }
}
