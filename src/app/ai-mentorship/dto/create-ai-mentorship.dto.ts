import { MenteeProficiency } from '@app/common/enum/MenteeProficiency';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAiMentorshipDto {
  @IsString()
  @ApiProperty({
    type: String,
  })
  mentorId: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  proficiencyLevel: MenteeProficiency;

  @IsString()
  @ApiProperty({
    type: String,
  })
  growthAreas: string;
}
