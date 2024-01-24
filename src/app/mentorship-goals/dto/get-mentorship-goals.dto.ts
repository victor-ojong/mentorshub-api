import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetMentorshipGoalDto {
  @IsString()
  @ApiProperty({ type: String, description: 'mentorshipId is required' })
  mentorshipId: string;
}
