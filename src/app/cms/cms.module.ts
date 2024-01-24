import { Module } from '@nestjs/common';

import { CMSService } from './cms.service';
import { CMSController } from './cms.controler';

@Module({
  controllers: [CMSController],
  providers: [CMSService],
  exports: [CMSService],
})
export class CMSModule {}
