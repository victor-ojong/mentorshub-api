import { Gender } from '@app/app/user/user.schema';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class SocialsSignupDto {
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Account type is a required property',
  })
  accountType: 'mentor' | 'mentee';

  @IsEnum(Gender)
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'This is an optional property',
  })
  gender: Gender;
}
