import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ChannelType } from '../notification.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RecipientData {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  id?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  variant?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  deviceId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  userId?: string;
}

class Channel {
  @IsString()
  @ApiProperty({ type: String })
  channel: ChannelType;

  @ValidateNested()
  @Type(() => RecipientData)
  recipient: RecipientData;
}

export class CreateNotificationDto {
  @IsObject()
  @ApiProperty({ type: String })
  from: unknown;

  @IsString()
  @ApiProperty({ type: String })
  title: string;

  @IsString()
  @ApiProperty({ type: String })
  content: string;

  @ValidateNested({ each: true })
  @Type(() => Channel)
  to: Channel[];
}
