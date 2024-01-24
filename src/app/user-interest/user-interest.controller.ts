import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Request as EpressRequest } from 'express';
import { UserInterestService } from './user-interest.service';
import { CreateUserInterestDto } from './dto/create-user-interest.dto';
import { FindUserInterestDto } from './dto/find-user-interest.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { JwtPayload } from '../authentication/authentication.constant';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('User Interest')
@Controller('user-interests')
export class UserInterestController {
  constructor(private readonly userInterestService: UserInterestService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Create user interest' })
  @ApiResponse({
    status: 201,
    description: 'User interest created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUserInterestDto })
  create(
    @Body() createUserInterestDto: CreateUserInterestDto,
    @Request() req: EpressRequest & { user: JwtPayload }
  ) {
    return this.userInterestService.create(createUserInterestDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Find all user interests' })
  @ApiResponse({
    status: 200,
    description: 'List of user interests',
  })
  @ApiQuery({
    type: FindUserInterestDto,
  })
  findAll(@Query() findInterestDto: FindUserInterestDto) {
    return this.userInterestService.findAll(findInterestDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a user interest by ID' })
  @ApiResponse({
    status: 200,
    description: 'User interest found successfully',
  })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.userInterestService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a user interest by ID' })
  @ApiResponse({
    status: 200,
    description: 'User interest removed successfully',
  })
  @ApiResponse({ status: 404, description: 'User interest not found' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.userInterestService.remove(id);
  }
}
