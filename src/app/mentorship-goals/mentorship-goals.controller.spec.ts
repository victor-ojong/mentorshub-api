import { Test, TestingModule } from '@nestjs/testing';
import { MentorshipGoalsController } from './mentorship-goals.controller';

describe('MentorshipGoalsController', () => {
  let controller: MentorshipGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorshipGoalsController],
    }).compile();

    controller = module.get<MentorshipGoalsController>(
      MentorshipGoalsController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
