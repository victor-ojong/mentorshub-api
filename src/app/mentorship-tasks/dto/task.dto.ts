import { IDuration } from '@app/common/functions/getDueDateFromDuration';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TaskDto {
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
