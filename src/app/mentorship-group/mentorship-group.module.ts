import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MentorshipGroupService } from './mentorship-group.service';
import { MentorshipGroupController } from './mentorship-group.controller';
import {
  MentorshipGroup,
  MentorshipGroupSchema,
} from './mentorship-group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MentorshipGroup.name, schema: MentorshipGroupSchema },
    ]),
  ],
  controllers: [MentorshipGroupController],
  providers: [MentorshipGroupService],
  exports: [MentorshipGroupService],
})
export class MentorshipGroupModule {}
