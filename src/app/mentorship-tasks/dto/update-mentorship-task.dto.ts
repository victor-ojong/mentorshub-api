import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMentorshipTaskDto } from './create-mentoship-task.dto';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@app/common/enum/TaskStatus';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

export class UpdateMentorshipTaskDto extends PartialType(
  OmitType(CreateMentorshipTaskDto, ['menteeId', 'mentorshipGoalId'] as const)
) {
  @IsOptional()
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  @ApiProperty({
    enum: TaskStatus,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => mongoose.Types.ObjectId)
  todo?: mongoose.Types.ObjectId[];
}
