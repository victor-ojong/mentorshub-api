import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindSubscriptionPlansDto {
  @IsString()
  @ApiPropertyOptional({
    type: String,
  })
  mentorId: string;
}
