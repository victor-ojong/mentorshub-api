import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlansController } from './subscriptionPlans.controller';

describe('PlansController', () => {
  let controller: SubscriptionPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionPlansController],
    }).compile();

    controller = module.get<SubscriptionPlansController>(
      SubscriptionPlansController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
