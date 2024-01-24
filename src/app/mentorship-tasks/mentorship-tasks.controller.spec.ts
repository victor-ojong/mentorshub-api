import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipTasksController } from './mentorship-tasks.controller';

describe('MentorshipTasksController', () => {
  let controller: MentorshipTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorshipTasksController],
    }).compile();

    controller = module.get<MentorshipTasksController>(
      MentorshipTasksController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
