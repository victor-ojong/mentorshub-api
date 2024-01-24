import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  index() {
    this.logger.log('Mentored server is online');
    return {
      message: 'Server is online',
    };
  }
}
