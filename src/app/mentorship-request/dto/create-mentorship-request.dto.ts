import { MenteeProficiency } from '@app/common/enum/MenteeProficiency';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class CreateMentorshipRequestDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Mentee Id property is required',
  })
  menteeId: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Mentor Id property is required',
  })
  mentorId: string;

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
}
