import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpException,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as _ from 'lodash';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { FindUserDto } from './dto/find-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @UseInterceptors(FileInterceptor('profileImg'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User creation data with profile image',
    type: CreateUserDto,
    required: true,
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profileImg: Express.Multer.File
  ) {
    return this.usersService.create(createUserDto, profileImg);
  }

  @Get('users')
  @ApiOperation({ summary: 'Find all mentors' })
  @ApiQuery({
    name: 'query',
    type: FindUserDto,
  })
  async findAllMentors(@Query() query?: FindUserDto) {
    return this.usersService.findAllMentors(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieving users profile' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @Get('users/profile')
  async getProfile(@Request() req: any) {
    return await this.usersService.findOne({ _id: req.user.id });
  }

  @Get('exists')
  @ApiResponse({
    status: 200,
    description: 'Check if a user exists',
    type: Boolean,
  })
  @ApiQuery({
    name: 'emailOrPhone',
    type: String,
    required: true,
    description: 'Email or phone number of the user',
  })
  @ApiOperation({ summary: 'Checking if the user exist' })
  async userExists(@Query() query: FindUserDto) {
    if (_.isEmpty(query)) {
      throw new HttpException(
        'query should not be empty. Please pass in email or phone',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this.usersService.findOne(query);

    if (user) {
      return { exists: true };
    } else {
      return { exists: false };
    }
  }
  @Patch('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Update User Data' })
  @ApiParam({ name: 'id', type: String, description: 'user ID' })
  @ApiBody({ type: [UpdateUserDto] })
  @UseInterceptors(FileInterceptor('profileImg'))
  async update(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImg?: Express.Multer.File
  ) {
    return this.usersService.updateProfile(userId, updateUserDto, profileImg);
  }

  @Get('user/:id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve user by ID',
  })
  @ApiOperation({ summary: 'Retrieve user by ID' })
  @ApiParam({ name: 'id', type: String })
  async findUserById(@Param('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get('mentors/:id')
  @ApiResponse({
    status: 200,
    description: 'Retrieve user by ID',
  })
  @ApiOperation({ summary: 'Retrieve user by ID' })
  @ApiParam({ name: 'id', type: String })
  async findMentorById(@Param('id') userId: string) {
    return this.usersService.findMentorById(userId);
  }
}
