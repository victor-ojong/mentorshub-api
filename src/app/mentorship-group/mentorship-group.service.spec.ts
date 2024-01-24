import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipGroupService } from './mentorship-group.service';

describe('MentorshipGroupService', () => {
  let service: MentorshipGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorshipGroupService],
    }).compile();

    service = module.get<MentorshipGroupService>(MentorshipGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
