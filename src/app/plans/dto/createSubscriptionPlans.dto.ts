import { SubscriptionPlanTypes } from '@app/common/enum/SubscriptionPlanTypes';
import { IDuration } from '@app/common/functions/getDueDateFromDuration';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSubscriptionPlansDto {
  @IsOptional()
  @IsEnum(SubscriptionPlanTypes, {})
  @ApiProperty({ enum: SubscriptionPlanTypes })
  type?: SubscriptionPlanTypes = SubscriptionPlanTypes.BASIC;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @ApiProperty({ type: Number, description: 'amount must be a number' })
  amount: number;

  @IsOptional()
  @Matches(/^\d+[dwm]$/, {
    message:
      'duration should be numbers followed by either d for days, w for weeks or m for months: 4d or 4w or 4m',
  })
  @IsString()
  @ApiProperty({ type: String })
  duration?: IDuration = '1m';

  @IsString()
  @ApiProperty({ type: String })
  description: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @ApiProperty({ type: Number, description: 'slot must be a number' })
  slot?: number = 0;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @ApiProperty({ type: Number, description: 'session count must be provided' })
  sessionCount: number;
}
