import { Module, forwardRef } from '@nestjs/common';
import { MentorshipGoalsController } from './mentorship-goals.controller';
import { MentorshipGoalsService } from './mentorship-goals.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MentorshipGoal } from './mentorship-goals.schema';
import { MentorshipModule } from '../mentorship/mentorship.module';
import { SessionModule } from '../session/session.module';
import { MentorshipService } from '../mentorship/mentorship.service';
import { mentorshipGoalSchemaMiddleware } from './helpers/MentorshipGoalSchema.middleware';
import { MentorshipTasksModule } from '../mentorship-tasks/mentorship-tasks.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: MentorshipGoal.name,
        imports: [MentorshipModule],
        useFactory: mentorshipGoalSchemaMiddleware,
        inject: [MentorshipService],
      },
    ]),
    MentorshipModule,
    SessionModule,
    forwardRef(() => MentorshipTasksModule),
  ],
  controllers: [MentorshipGoalsController],
  providers: [MentorshipGoalsService],
  exports: [MentorshipGoalsService],
})
export class MentorshipGoalsModule {}
