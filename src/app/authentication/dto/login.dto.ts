import { IsNotEmpty, IsString } from 'class-validator';
import { IsEmailOrHandle } from '../../../lib/utils.lib';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsEmailOrHandle({
    message:
      'value should be a valid email or username of atleast 3 characters',
  })
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  emailOrHandle: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'This is a required property',
  })
  password: string;
}
