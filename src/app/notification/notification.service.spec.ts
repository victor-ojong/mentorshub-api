import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Notification, OutboundNotification } from './notification.schema';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: 'channels', useValue: {} },
        { provide: getModelToken(OutboundNotification.name), useValue: {} },
        { provide: getModelToken(Notification.name), useValue: {} },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
