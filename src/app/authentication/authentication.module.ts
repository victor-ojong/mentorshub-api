import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { config } from '@app/config';

import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { queues } from '../../queue/config.queue';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { VerificationService } from './verification.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationModule } from '../notification/notification.module';
import { OtpModule } from '../otp/otp.module';

import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LinkedinStrategy } from './strategies/linkedin.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: '7 days' },
    }),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    BullModule.registerQueue({
      name: queues.notification.name,
    }),
    NotificationModule,
    OtpModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    VerificationService,
    LocalStrategy,
    JwtStrategy,
    GithubStrategy,
    GoogleStrategy,
    LinkedinStrategy,
    ConfigService,
  ],
  exports: [JwtStrategy],
})
export class AuthenticationModule {}
