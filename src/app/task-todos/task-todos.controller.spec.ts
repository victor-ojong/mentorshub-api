import { Test, TestingModule } from '@nestjs/testing';
import { TaskTodosController } from './task-todos.controller';

describe('TaskTodosController', () => {
  let controller: TaskTodosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskTodosController],
    }).compile();

    controller = module.get<TaskTodosController>(TaskTodosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
