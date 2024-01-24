import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindNotificationDto {
  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({ type: Number })
  perPage?: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({ type: Number })
  page?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  sort?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  isRead?: string;
}
