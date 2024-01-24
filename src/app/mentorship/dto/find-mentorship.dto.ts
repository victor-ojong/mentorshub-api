import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorshipDto } from './create-mentorship.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Options } from '@app/common/dto/options.dto';

export class FindMentorshipDto extends PartialType(CreateMentorshipDto) {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    type: Options,
  })
  options?: Options;
}
