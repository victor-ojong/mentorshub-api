import { MentorMenteeDto } from '@app/common/dto/mentor-mentee.dto';
import { MenteeProficiency } from '@app/common/enum/MenteeProficiency';
import { MentorshipType } from '@app/common/enum/MentorshipType';
import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateMentorshipDto extends PickType(MentorMenteeDto, [
  'mentorId',
] as const) {
  @IsEnum(MenteeProficiency)
  @ApiProperty({
    description: 'Mentee proficiency level is required',
    enum: MenteeProficiency,
  })
  proficiencyLevel: MenteeProficiency;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Mentee growth areas is required',
  })
  growthAreas: string;

  @IsOptional()
  @IsEnum(MentorshipType)
  @ApiProperty({
    description: 'Mentorship type',
    enum: MentorshipType,
  })
  mentorshipType?: MentorshipType;
}
