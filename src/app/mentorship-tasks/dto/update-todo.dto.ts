import { CreateTodoDto } from './create-todo.dto';
import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto extends CreateTodoDto {
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  isCompleted: boolean;
}
