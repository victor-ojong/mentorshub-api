import { Options } from '@app/common/dto/options.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateInterestDto } from './create-interest.dto';

export class FindInterestDto extends PartialType(CreateInterestDto) {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    type: Options,
  })
  options: Options;
}
