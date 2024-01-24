import { Module, forwardRef } from '@nestjs/common';
import { MentorshipTasksController } from './mentorship-tasks.controller';
import { MentorshipTasksService } from './mentorship-tasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task } from './mentorship-tasks.schema';
import { MentorshipGoalsModule } from '../mentorship-goals/mentorship-goals.module';
import { MentorshipGoalsService } from '../mentorship-goals/mentorship-goals.service';
import { mentorshipTaskSchemaMiddleware } from './helper/mentorshipTaskSchema.middleware';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Task.name,
        imports: [forwardRef(() => MentorshipGoalsModule)],
        useFactory: mentorshipTaskSchemaMiddleware,
        inject: [MentorshipGoalsService],
      },
    ]),
    forwardRef(() => MentorshipGoalsModule),
  ],
  controllers: [MentorshipTasksController],
  providers: [MentorshipTasksService],
  exports: [MentorshipTasksService],
})
export class MentorshipTasksModule {}
