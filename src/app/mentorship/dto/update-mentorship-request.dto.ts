import { MentorMenteeDto } from '@app/common/dto/mentor-mentee.dto';
import { PickType } from '@nestjs/mapped-types';

export class AcceptRejectMentorshipRequestDto extends PickType(
  MentorMenteeDto,
  ['menteeId'] as const
) {}

export class CancelMentorshipRequestDto extends PickType(MentorMenteeDto, [
  'mentorId',
] as const) {}
