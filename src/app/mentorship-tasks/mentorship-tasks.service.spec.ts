import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipTasksService } from './mentorship-tasks.service';

describe('MentorshipTasksService', () => {
  let service: MentorshipTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorshipTasksService],
    }).compile();

    service = module.get<MentorshipTasksService>(MentorshipTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
