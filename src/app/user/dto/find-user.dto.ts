import { PartialType } from '@nestjs/mapped-types';
import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    type: String,
  })
  id?: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  perPage?: number;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  page?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
  })
  sort?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  jobTitle?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  industry?: string;

  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    type: [String],
    isArray: true,
  })
  stack?: string[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  yearsOfExperience?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    type: String,
  })
  search?: string;
}
