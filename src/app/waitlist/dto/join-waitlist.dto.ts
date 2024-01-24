import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinWaitlistDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Email property is required' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Firstname property is required' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Last name property is required' })
  lastName: string;

  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'User type field is required',
  })
  accountType?: 'mentor' | 'mentee';
}
