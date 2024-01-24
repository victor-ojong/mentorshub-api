import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { MentorshipSessionStatus } from '../session.schema';
import { ApiProperty } from '@nestjs/swagger';
class DateTime {
  @IsString()
  date: string;

  @IsString()
  time: string;
}

export class UpdateSsessionDto {
  @IsObject({ each: true })
  @IsOptional()
  @ApiProperty({
    type: DateTime,
    isArray: true,
    description: 'Array of date and time objects for session update',
  })
  updateDate?: DateTime[];

  @IsEnum(MentorshipSessionStatus, {
    message: `status must be ${MentorshipSessionStatus.SCHEDULED}, ${MentorshipSessionStatus.CONFIRMED}, or ${MentorshipSessionStatus.CANCELLED}`,
  })
  @IsOptional()
  @ApiProperty({
    enum: MentorshipSessionStatus,
    description: 'Status of the mentorship session update',
  })
  status?: MentorshipSessionStatus;
}
