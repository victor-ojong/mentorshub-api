import { BullModule } from '@nestjs/bull';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './app/authentication/authentication.module';
import { DatabaseModule } from './app/database/database.module';
import { ExceptionsFilter } from './lib/exceptions-filter.lib';
import { Config } from './config';
import { MentorshipModule } from './app/mentorship/mentorship.module';
import { MentorshipGroupModule } from './app/mentorship-group/mentorship-group.module';
import { MentorshipRequestModule } from './app/mentorship-request/mentorship-request.module';
import { CMSModule } from './app/cms/cms.module';
import { WaitlistModule } from './app/waitlist/waitlist.module';
import { ContactUsModule } from './app/contact-us/contact-us.module';
import { SessionModule } from './app/session/session.module';
import { InterestModule } from './app/interest/interest.module';
import { UserInterestModule } from './app/user-interest/user-interest.module';
import { MentorshipGoalsModule } from './app/mentorship-goals/mentorship-goals.module';
import { MentorshipTasksModule } from './app/mentorship-tasks/mentorship-tasks.module';
import { TaskTodosModule } from './app/task-todos/task-todos.module';
import { AvailabilityModule } from './app/availability/availability.module';
import { SubscriptionPlansModule } from './app/plans/subscriptionPlans.module';
import { SubscriptionsModule } from './app/subscriptions/subscriptions.module';
import { AiMentorshipModule } from './app/ai-mentorship/ai-mentorship.module';

@Module({})
export class AppModule {
  static forRoot({ config }: { config: Config }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggerModule.forRoot(),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => config],
          ignoreEnvFile: false,
          ignoreEnvVars: true,
        }),
        BullModule.forRoot({
          redis: {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            username: config.redis.username,
          },
        }),
        DatabaseModule.forRoot(config),
        AuthenticationModule,
        MentorshipModule,
        MentorshipGroupModule,
        MentorshipRequestModule,
        CMSModule,
        WaitlistModule,
        ContactUsModule,
        SessionModule,
        InterestModule,
        UserInterestModule,
        MentorshipGoalsModule,
        MentorshipTasksModule,
        AvailabilityModule,
        TaskTodosModule,
        SubscriptionPlansModule,
        SubscriptionsModule,
        AiMentorshipModule,
      ],
      controllers: [AppController],
      providers: [
        { provide: APP_FILTER, useClass: ExceptionsFilter },
        AppService,
      ],
    };
  }
}
