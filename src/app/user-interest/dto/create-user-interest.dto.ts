import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserInterestDto {
  @ApiProperty({
    isArray: true,
    type: String,
    description: 'Array of interest IDs as strings',
    example: ['interestId1', 'interestId2'],
  })
  @IsString({
    each: true,
    message: 'Each element in interestIds must be a string',
  })
  interestIds?: string[];
}
