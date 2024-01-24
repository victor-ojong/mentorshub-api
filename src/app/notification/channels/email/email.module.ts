import { DynamicModule, Module } from '@nestjs/common';

import { EmailService } from './email.service';
import {
  EmailConfig,
  EMAIl_PROVIDERS,
} from '../../../../gateway/email/email.types';
import { Resend } from '@app/gateway/email/providers/resend';

@Module({})
export class EmailModule {
  static forRoot(config: {
    client: EMAIl_PROVIDERS;
    emailConfig: EmailConfig;
    global?: boolean;
  }): DynamicModule {
    return {
      module: EmailModule,
      exports: [EmailService],
      providers: [
        {
          provide: EmailService,
          useValue: new EmailService(
            new Resend({ apiKey: config.emailConfig.apiKey })
          ),
        },
      ],
      global: config.global ?? true,
    };
  }
}
