import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MentorMenteeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  mentorId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  menteeId: string;
}
