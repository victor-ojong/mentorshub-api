import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto extends PartialType(
  OmitType(CreateTodoDto, ['mentorshipTaskId'])
) {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  isCompleted: boolean;
}
