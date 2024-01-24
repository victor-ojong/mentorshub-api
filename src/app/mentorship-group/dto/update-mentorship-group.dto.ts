import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorshipGroupDto } from './create-mentorship-group.dto';

export class UpdateMentorshipGroupDto extends PartialType(
  CreateMentorshipGroupDto
) {}
