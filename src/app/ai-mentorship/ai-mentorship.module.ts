import { Module } from '@nestjs/common';
import { AiMentorshipService } from './ai-mentorship.service';
import { UserModule } from '../user/user.module';
import { AiMentorshipController } from './ai-mentorship.controller';
import { MentorshipModule } from '../mentorship/mentorship.module';
import { MentorshipGoalsModule } from '../mentorship-goals/mentorship-goals.module';

@Module({
  imports: [UserModule, MentorshipModule, MentorshipGoalsModule],
  controllers: [AiMentorshipController],
  providers: [AiMentorshipService],
})
export class AiMentorshipModule {}
