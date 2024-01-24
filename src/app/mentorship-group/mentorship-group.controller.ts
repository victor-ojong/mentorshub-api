import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MentorshipGroupService } from './mentorship-group.service';
import { CreateMentorshipGroupDto } from './dto/create-mentorship-group.dto';
import { UpdateMentorshipGroupDto } from './dto/update-mentorship-group.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('mentorship-group')
@ApiTags('Mentorship Groups')
@Controller('mentorship-group')
export class MentorshipGroupController {
  constructor(
    private readonly mentorshipGroupService: MentorshipGroupService
  ) {}
}
