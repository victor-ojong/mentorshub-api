import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateOrUpdateAvailability {
  @IsObject({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  availableDates?: { date: string; time: string[] }[];

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  availableSlots?: number;
}
