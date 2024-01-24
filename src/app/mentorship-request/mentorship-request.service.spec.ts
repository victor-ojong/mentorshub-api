import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipRequestService } from './mentorship-request.service';

describe('MentorshipRequestService', () => {
  let service: MentorshipRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorshipRequestService],
    }).compile();

    service = module.get<MentorshipRequestService>(MentorshipRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
