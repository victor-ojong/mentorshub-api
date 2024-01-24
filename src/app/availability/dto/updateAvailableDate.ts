import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateAvailableDateDto {
  @IsObject({ each: true })
  @ApiPropertyOptional({
    type: String,
  })
  availableDates: { date: string; time: string[] }[];
}
