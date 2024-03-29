import { Test, TestingModule } from '@nestjs/testing';
import { UserInterestController } from './user-interest.controller';
import { UserInterestService } from './user-interest.service';

describe('UserInterestController', () => {
  let controller: UserInterestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInterestController],
      providers: [UserInterestService],
    }).compile();

    controller = module.get<UserInterestController>(UserInterestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
