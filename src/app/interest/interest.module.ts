import { Module } from '@nestjs/common';
import { InterestService } from './interest.service';
import { InterestController } from './interest.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Interest, InterestSchema } from './interest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Interest.name,
        schema: InterestSchema,
      },
    ]),
  ],
  controllers: [InterestController],
  providers: [InterestService],
})
export class InterestModule {}
