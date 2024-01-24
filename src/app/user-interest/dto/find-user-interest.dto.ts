import { Options } from '@app/common/dto/options.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserInterestDto } from './create-user-interest.dto';

export class FindUserInterestDto extends PartialType(CreateUserInterestDto) {
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional({
    type: Options,
  })
  options: Options;
}
