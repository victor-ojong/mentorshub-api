import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipRequestController } from './mentorship-request.controller';
import { MentorshipRequestService } from './mentorship-request.service';

describe('MentorshipRequestController', () => {
  let controller: MentorshipRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorshipRequestController],
      providers: [MentorshipRequestService],
    }).compile();

    controller = module.get<MentorshipRequestController>(
      MentorshipRequestController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
