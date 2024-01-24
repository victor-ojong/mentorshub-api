import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Availability, AvailabilitySchema } from './availability.schema';
import { AvailabilityService } from './availability.service';
import { UserModule } from '../user/user.module';
import { AvailabilityController } from './availability.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Availability.name,
        schema: AvailabilitySchema,
      },
    ]),
    UserModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
