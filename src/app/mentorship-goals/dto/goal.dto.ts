import { TaskDto } from '@app/app/mentorship-tasks/dto/task.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class GoalDto {
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

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: Array })
  tasks: TaskDto[];
}
