import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Account type is a required property',
  })
  accountType: 'mentor' | 'mentee';
}
