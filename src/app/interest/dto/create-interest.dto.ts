import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @ApiProperty({ type: String })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  description?: string;
}
