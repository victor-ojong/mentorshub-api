import { Options } from '@app/common/dto/options.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { CreateMentorshipRequestDto } from './create-mentorship-request.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindMentorshipRequestDto extends PartialType(
  CreateMentorshipRequestDto
) {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    type: Options,
  })
  options: Options;
}
