import { IDuration } from '@app/common/functions/getDueDateFromDuration';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Matches } from 'class-validator';
import { TaskDto } from './task.dto';

export class CreateMentorshipTaskDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'menteeId is required' })
  menteeId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'mentorshipGoalId is required' })
  mentorshipGoalId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'title is required' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'description is required' })
  description: string;

  @Matches(/^\d+[dwm]$/, {
    message:
      'duration should be numbers followed by either d for days, w for weeks or m for months: 4d or 4w or 4m',
  })
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'duration is required' })
  duration: IDuration;
}

export class CreateMultipleMentorshipTaskDto extends PickType(
  CreateMentorshipTaskDto,
  ['menteeId', 'mentorshipGoalId'] as const
) {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: Array, description: 'tasks are required' })
  tasks: TaskDto[];
}
