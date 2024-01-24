import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { Request as EpressRequest } from 'express';
import { MentorshipRequestService } from './mentorship-request.service';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { FindMentorshipRequestDto } from './dto/find-mentorship-requests.dto';
import { JwtPayload } from '../authentication/authentication.constant';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer <token>',
  required: true,
})
@ApiTags('Mentorship Requests')
@Controller('')
export class MentorshipRequestController {
  constructor(
    private readonly mentorshipRequestService: MentorshipRequestService
  ) {}

  @Post('mentorship-requests')
  @ApiOperation({ summary: 'Create a mentorship request' })
  @ApiOkResponse({ description: 'Mentorship request created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiBody({
    type: CreateMentorshipRequestDto,
    description: 'Data for creating a mentorship request',
  })
  create(@Body() createMentorshipRequestDto: CreateMentorshipRequestDto) {
    return this.mentorshipRequestService.create(createMentorshipRequestDto);
  }

  @Get('mentees/:id/mentorship-requests')
  @ApiOperation({ summary: 'Find mentees mentorship requests' })
  @ApiOkResponse({
    description: 'Mentees mentorship requests retrieved successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentee',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  @ApiQuery({
    name: 'someQueryParam',
    required: false,
    description: 'An example query parameter',
  })
  findMenteesRequests(
    @Request() req: EpressRequest & { user: JwtPayload },
    @Param('id') menteeId: string,
    @Query() query: FindMentorshipRequestDto
  ) {
    if (req.user.sub !== menteeId) {
      throw new BadRequestException({
        message: 'Operation not allowed',
        field: 'id',
      });
    }
    query.menteeId = menteeId;
    return this.mentorshipRequestService.findAll(query);
  }

  @Get('mentors/:id/mentorship-requests')
  @ApiOperation({ summary: 'Find mentors mentorship requests' })
  @ApiOkResponse({
    description: 'Mentors mentorship requests retrieved successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentor',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  @ApiQuery({
    name: 'someQueryParam',
    required: false,
    description: 'An example query parameter',
  })
  findMentorsRequests(
    @Request() req: EpressRequest & { user: JwtPayload },
    @Param('id') mentorId: string,
    @Query() query: FindMentorshipRequestDto
  ) {
    if (req.user.sub !== mentorId) {
      throw new BadRequestException({
        message: 'Operation not allowed',
        field: 'id',
      });
    }
    query.mentorId = mentorId;
    return this.mentorshipRequestService.findAll(query);
  }

  @Get('mentorship-requests/:id')
  @ApiOperation({
    summary: 'Find a mentorship request by ID',
    description: 'Retrieve details of a specific mentorship request.',
  })
  @ApiOkResponse({
    description: 'Mentorship request retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Mentorship request not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship request',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  async findOne(@Param('id') id: string) {
    const mentorshipRequest = await this.mentorshipRequestService.findOne(id);

    if (!mentorshipRequest) {
      throw new NotFoundException('Mentorship request not found');
    }

    return mentorshipRequest;
  }

  @Patch('mentorship-requests/:id/accept')
  @ApiOperation({
    summary: 'Accept a mentorship request',
    description: 'Accept a specific mentorship request by ID.',
  })
  @ApiOkResponse({
    description: 'Mentorship request accepted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Mentorship request not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship request',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  async accept(
    @Param('id') id: string,
    @Request() req: EpressRequest & { user: JwtPayload }
  ) {
    return await this.mentorshipRequestService.accept(id, req.user);
  }

  @Patch('mentorship-requests/:id/reject')
  @ApiOperation({
    summary: 'Reject a mentorship request',
    description: 'Reject a specific mentorship request by ID.',
  })
  @ApiOkResponse({
    description: 'Mentorship request rejected successfully',
  })
  @ApiNotFoundResponse({
    description: 'Mentorship request not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship request',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  reject(
    @Param('id') id: string,
    @Request() req: EpressRequest & { user: JwtPayload }
  ) {
    return this.mentorshipRequestService.reject(id, req.user);
  }

  @Patch('mentorship-requests/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancel a mentorship request',
    description: 'Cancel a specific mentorship request by ID.',
  })
  @ApiOkResponse({
    description: 'Mentorship request canceled successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized user',
  })
  @ApiNotFoundResponse({
    description: 'Mentorship request not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship request',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  cancel(
    @Param('id') id: string,
    @Request() req: EpressRequest & { user: JwtPayload }
  ) {
    return this.mentorshipRequestService.cancel(id, req.user);
  }

  @Patch('mentorship-requests/:id/confirm-acceptance')
  @ApiOperation({
    summary: 'Confirm acceptance of a mentorship request',
    description:
      'Confirm that a specific mentorship request has been accepted by ID.',
  })
  @ApiOkResponse({
    description: 'Mentorship request acceptance confirmed successfully',
  })
  @ApiNotFoundResponse({
    description: 'Mentorship request not found',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship request',
    type: String,
    example: '5f9f4f9a022cf159f0b5e3c6',
  })
  confirmAcceptance(
    @Param('id') id: string,
    @Request() req: EpressRequest & { user: JwtPayload }
  ) {
    return this.mentorshipRequestService.confirmAcceptance(id, req.user);
  }
}
