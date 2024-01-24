import { Test, TestingModule } from '@nestjs/testing';
import { TaskTodosService } from './task-todos.service';

describe('TaskTodosService', () => {
  let service: TaskTodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskTodosService],
    }).compile();

    service = module.get<TaskTodosService>(TaskTodosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
