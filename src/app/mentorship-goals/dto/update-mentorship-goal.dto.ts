import { GoalStatus } from '@app/common/enum/GoalStatus';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { CreateMentorshipGoalDto } from './create-mentorship-goal.dto';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class UpdateMentorshipGoalDto extends PartialType(
  OmitType(CreateMentorshipGoalDto, ['menteeId', 'mentorshipId'] as const)
) {
  @IsOptional()
  @IsEnum(GoalStatus)
  @IsNotEmpty()
  @ApiProperty({
    enum: GoalStatus,
  })
  status?: GoalStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => mongoose.Types.ObjectId)
  task?: mongoose.Types.ObjectId[];
}
