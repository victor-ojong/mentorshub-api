import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindSessionDto {
  @IsString()
  @ApiProperty({ type: String })
  id: string;
}
