import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindMentorAvailability {
  @IsString()
  @ApiPropertyOptional({
    type: String,
  })
  mentorId: string;
}
