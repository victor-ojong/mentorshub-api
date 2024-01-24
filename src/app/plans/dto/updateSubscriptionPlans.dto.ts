import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionPlansDto } from './createSubscriptionPlans.dto';
import { SubscriptionPlansStatus } from '@app/common/enum/SubscriptionPlanStatus';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateSubscriptionPlansDto extends PartialType(
  CreateSubscriptionPlansDto
) {
  @IsOptional()
  @IsEnum(SubscriptionPlansStatus)
  @ApiProperty({ enum: SubscriptionPlansStatus })
  status?: SubscriptionPlansStatus;
}
