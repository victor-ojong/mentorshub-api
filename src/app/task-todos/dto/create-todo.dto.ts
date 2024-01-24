import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'description is required' })
  description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'mentorshipTaskId is required' })
  mentorshipTaskId: string;
}
