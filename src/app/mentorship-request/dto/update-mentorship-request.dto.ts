import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorshipRequestDto } from './create-mentorship-request.dto';

export class UpdateMentorshipRequestDto extends PartialType(
  CreateMentorshipRequestDto
) {}
