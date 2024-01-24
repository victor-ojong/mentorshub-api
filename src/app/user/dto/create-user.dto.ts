import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Firstname property is required',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Lastname property is required',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Email property is required',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Password property is required',
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'User type field is optional',
  })
  accountType?: 'mentor' | 'mentee';

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'Email verification status',
  })
  emailVerifiedAt?: Date;

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    isArray: true,
  })
  socialUrls?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  jobTitle?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  industry?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  careerSummary?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  techTrack?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  timeZone?: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    isArray: true,
  })
  stack?: string[];

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    isArray: true,
  })
  tools?: string[];

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    isArray: true,
  })
  interestedTools?: string[];

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
  country?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  hasExperience?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  yearsOfExperience?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  learningPeriod?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  company?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  shortSummary?: string;
}
