import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipGoalsService } from './mentorship-goals.service';

describe('MentorshipGoalsService', () => {
  let service: MentorshipGoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorshipGoalsService],
    }).compile();

    service = module.get<MentorshipGoalsService>(MentorshipGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
