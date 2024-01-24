import { IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactUsDto {
  @IsString()
  @ApiProperty({ type: String, description: 'First name property is required' })
  firstName: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Last name property is required' })
  lastName: string;

  @IsEmail()
  @ApiProperty({ type: String, description: 'Email property is required' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Message title title property is required',
  })
  messageTitle: string;

  @IsString()
  @ApiPropertyOptional({
    type: String,
    description: 'Message property is required',
  })
  message?:
    | 'What those Mentor do'
    | 'i need a mentoe'
    | 'i am a student can i start tech';
}
