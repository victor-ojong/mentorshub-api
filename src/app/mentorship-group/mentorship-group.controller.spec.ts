import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipGroupController } from './mentorship-group.controller';
import { MentorshipGroupService } from './mentorship-group.service';

describe('MentorshipGroupController', () => {
  let controller: MentorshipGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorshipGroupController],
      providers: [MentorshipGroupService],
    }).compile();

    controller = module.get<MentorshipGroupController>(
      MentorshipGroupController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
