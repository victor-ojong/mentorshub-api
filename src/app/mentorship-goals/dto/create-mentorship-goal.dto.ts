import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GoalDto } from './goal.dto';
import { PickType } from '@nestjs/mapped-types';

export class CreateMentorshipGoalDto extends PickType(GoalDto, [
  'tasks',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'menteeId is required' })
  menteeId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'mentorshipId is required' })
  mentorshipId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'title is required' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  subtitle: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'description is required' })
  description: string;
}

export class CreateMultipleMentorshipGoalDto extends PickType(
  CreateMentorshipGoalDto,
  ['menteeId', 'mentorshipId'] as const
) {
  @IsNotEmpty()
  @IsArray()
  goals: GoalDto[];
}
