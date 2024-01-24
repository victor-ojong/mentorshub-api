import { PickType } from '@nestjs/mapped-types';
import { CreateMentorshipTaskDto } from './create-mentoship-task.dto';

export class GetMentorshipTaskDto extends PickType(CreateMentorshipTaskDto, [
  'mentorshipGoalId',
] as const) {}
