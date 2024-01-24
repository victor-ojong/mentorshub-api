import { CreateMentorshipDto } from '@app/app/mentorship/dto/create-mentorship.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubscriptionDto extends CreateMentorshipDto {
  @IsString()
  @ApiProperty({ type: String, description: 'PlanId is required' })
  planId: string;
}
