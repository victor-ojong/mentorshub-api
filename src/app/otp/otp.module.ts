import { Module } from '@nestjs/common';

import { generateToken } from '../../lib/utils.lib';
import { OtpService } from './otp.service';

@Module({
  providers: [
    OtpService,
    { provide: 'token-generator', useValue: generateToken },
  ],
  exports: [OtpService],
})
export class OtpModule {}
