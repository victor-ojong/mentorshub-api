import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAiSessionDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  message: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  mentorshipId: string;
}
