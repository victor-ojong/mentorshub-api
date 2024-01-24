import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class Options {
  @IsNumberString()
  @IsOptional()
  @ApiProperty({ type: Number })
  perPage?: number;

  @IsNumberString()
  @IsOptional()
  @ApiProperty({ type: Number })
  page?: number;

  @ApiProperty({
    required: false,
    type: 'object',
    description: 'Sorting criteria',
    example: { fieldName: 'ascending' },
  })
  sort?: Record<string, 'ascending' | 'descending'>;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  search?: string;
}
