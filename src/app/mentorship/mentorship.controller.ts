import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiNotFoundResponse,
  ApiParam,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { MentorshipService } from './mentorship.service';
import { UpdateMentorshipDto } from './dto/update-mentorship.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RoleGuard } from '@app/common/guards/rolesGuard/roles.guard';
import { Roles } from '@app/common/guards/rolesGuard/roles.decorator';
import { AccountType } from '@app/common/enum/AccountType';
import { Request as ExpressRequest } from 'express';

import { UserWithId } from '@app/common/enum/RequestUser';
import { FindMentorshipDto } from './dto/find-mentorship.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

const basePath = 'mentorships';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('')
@ApiTags('Mentorships')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  @Get(`${basePath}/:id`)
  @ApiOperation({ summary: 'Get a mentorship by ID' })
  @ApiOkResponse({ description: 'Mentorship retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Mentorship not found' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship to retrieve',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  async findOne(
    @Param('id') mentorshipId: string,
    @Request() req: ExpressRequest
  ) {
    const { _id } = req.user as UserWithId;

    return await this.mentorshipService.findOne(mentorshipId, _id);
  }

  @Patch(`${basePath}/:id`)
  @ApiOperation({ summary: 'Update a mentorship by ID' })
  @ApiOkResponse({ description: 'Mentorship updated successfully' })
  @ApiNotFoundResponse({ description: 'Mentorship not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship to update',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateMentorshipDto,
    description: 'Data for updating a mentorship',
  })
  async update(
    @Param('id') mentorshipId: string,
    @Body() updateMentorshipDto: UpdateMentorshipDto,
    @Request() req: ExpressRequest
  ) {
    const { _id } = req.user as UserWithId;
    return await this.mentorshipService.update({
      mentorshipId,
      updateMentorshipDto,
      userId: _id,
    });
  }

  @Get(`mentors/:id/${basePath}`)
  @ApiOperation({ summary: "Get all mentor's mentorship" })
  @ApiOkResponse({ description: 'Mentorships retrieved successfully' })
  @Roles(AccountType.MENTOR)
  async findMentorsMentorships(
    @Query() query: FindMentorshipDto,
    @Param('id') userId: string
  ) {
    return await this.mentorshipService.findAll(
      query,
      userId,
      AccountType.MENTOR
    );
  }

  @Get(`mentees/:id/${basePath}`)
  @ApiOperation({ summary: "Get all mentee's mentorship" })
  @ApiOkResponse({ description: 'Mentorships retrieved successfully' })
  async findMenteesMentorships(
    @Query() query: FindMentorshipDto,
    @Param('id') userId: string
  ) {
    return await this.mentorshipService.findAll(
      query,
      userId,
      AccountType.MENTEE
    );
  }
}
