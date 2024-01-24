import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../user/user.schema';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Lastname is a required property',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Firstname is a required property',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Email is a required property',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Password is a required property',
  })
  password: string;

  @IsEnum(Gender)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'This is an optional property',
  })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Account type is a required property',
  })
  accountType: 'mentor' | 'mentee';
}
