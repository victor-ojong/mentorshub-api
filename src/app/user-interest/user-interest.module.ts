import { Module } from '@nestjs/common';
import { UserInterestService } from './user-interest.service';
import { UserInterestController } from './user-interest.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInterest, UserInterestSchema } from './user-interest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserInterest.name,
        schema: UserInterestSchema,
      },
    ]),
  ],
  controllers: [UserInterestController],
  providers: [UserInterestService],
})
export class UserInterestModule {}
