import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';

import { Gender } from '../user.schema';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
class MeetingsNotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  inAppNotification?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Gender, {
    message: `gender must be ${Gender.male}, ${Gender.female} or ${Gender.other}`,
  })
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  gender?: Gender;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  profilePicture?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  password?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  currentPassword?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  shortSummary?: string;

  @ApiProperty({
    required: false,
    default: true,
    type: MeetingsNotificationDto,
  })
  @IsOptional()
  meetingsReminders?: MeetingsNotificationDto;

  @ApiProperty({
    required: false,
    default: true,
    type: MeetingsNotificationDto,
  })
  @IsOptional()
  updatesReminder?: MeetingsNotificationDto;
}
