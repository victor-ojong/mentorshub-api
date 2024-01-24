import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';

class DateTime {
  @IsString()
  date: string;

  @IsString()
  time: string;
}

export class CreateSessionDto {
  @IsString()
  @ApiProperty({ type: String })
  menteeId: string;

  @IsString()
  @ApiProperty({ type: String })
  mentorId: string;

  @IsObject({ each: true })
  @ApiProperty({
    type: DateTime,
    description: 'Array of date and time objects',
    isArray: true,
  })
  @ValidateNested({ each: true })
  date: DateTime[];

  @IsString()
  @ApiProperty({ type: String })
  roomName: string;

  @IsString()
  @ApiProperty({ type: String })
  mentorshipId: string;
}
