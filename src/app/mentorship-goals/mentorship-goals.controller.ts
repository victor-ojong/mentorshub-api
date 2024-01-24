import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiNotFoundResponse,
  ApiHeader,
  ApiOAuth2,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { RoleGuard } from '@app/common/guards/rolesGuard/roles.guard';
import { Roles } from '@app/common/guards/rolesGuard/roles.decorator';
import { AccountType } from '@app/common/enum/AccountType';
import { MentorshipGoalsService } from './mentorship-goals.service';
import {
  CreateMentorshipGoalDto,
  CreateMultipleMentorshipGoalDto,
} from './dto/create-mentorship-goal.dto';
import { GetMentorshipGoalDto } from './dto/get-mentorship-goals.dto';
import { UpdateMentorshipGoalDto } from './dto/update-mentorship-goal.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
@ApiOAuth2(['mentee', 'mentor'])
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer <token>',
  required: true,
})
@ApiTags('Mentorship Goals')
@Controller('mentorship-goals')
export class MentorshipGoalsController {
  constructor(private readonly mentorshipGoalService: MentorshipGoalsService) {}

  @Post()
  @Roles(AccountType.MENTOR)
  @ApiOperation({ summary: 'Create a mentorship goal' })
  @ApiCreatedResponse({ description: 'Mentorship goal created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiBody({
    type: CreateMentorshipGoalDto,
    description: 'Data for creating a mentorship goal',
  })
  createGoal(
    @Body() createMentorshipGoalDto: CreateMentorshipGoalDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    const mentorId = req.user._id;

    return this.mentorshipGoalService.create(createMentorshipGoalDto, mentorId);
  }

  @Post('/multiple')
  @Roles(AccountType.MENTOR)
  @ApiOperation({ summary: 'Create multiple mentorship goals' })
  @ApiCreatedResponse({ description: 'Mentorship goal created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiBody({
    type: CreateMentorshipGoalDto,
    description: 'Data for creating a mentorship goal',
  })
  createMultipleGoals(
    @Body() createMultipleMentorshipGoalDto: CreateMultipleMentorshipGoalDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    const mentorId = req.user._id;

    return this.mentorshipGoalService.createMultipleGoals(
      createMultipleMentorshipGoalDto,
      mentorId
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get mentorship goals' })
  @ApiOkResponse({ description: 'Mentorship goals retrieved successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  async getGoals(
    @Body() getMentorshipGoalDto: GetMentorshipGoalDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    return await this.mentorshipGoalService.findMentorshipGoal(
      getMentorshipGoalDto,
      req.user._id,
      req.user.accountType
    );
  }

  @Roles(AccountType.MENTOR)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a mentorship goal by ID' })
  @ApiOkResponse({ description: 'Mentorship goal updated successfully' })
  @ApiNotFoundResponse({ description: 'Mentorship goal not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship goal to update',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateMentorshipGoalDto,
    description: 'Data for updating a mentorship goal',
  })
  async updateGoal(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true }))
    updateMentorshipGoalDto: UpdateMentorshipGoalDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    const result = await this.mentorshipGoalService.update(
      id,
      updateMentorshipGoalDto,
      req.user._id
    );

    if (!result) {
      throw new NotFoundException(`No Goal is found for this id ${id}`);
    }

    return result;
  }
}
