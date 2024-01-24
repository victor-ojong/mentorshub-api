import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { UsersController } from './user.controller';
import { JwtStrategy } from '../authentication/strategies/jwt.strategy';
import { User, UserSchema } from './user.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UserService, JwtStrategy],
  exports: [UserService, UserModule],
})
export class UserModule {}
