import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './task-todos.schema';
import { Model } from 'mongoose';
/* import { CreateTodoDto } from './dto/create-todo.dto'; */
import { UpdateTodoDto } from './dto/update-todo.dto';
import { MentorshipTasksService } from '../mentorship-tasks/mentorship-tasks.service';

@Injectable()
export class TaskTodosService {
  private logger = new Logger(TaskTodosService.name);

  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
    private readonly mentorshipTasksService: MentorshipTasksService
  ) {}

  /*   async create(createTodoDto: CreateTodoDto) {
    this.logger.log('creating todo', createTodoDto);
    const task = await this.mentorshipTasksService.findOne(
      createTodoDto.mentorshipTaskId
    );
    if (!task) {
      throw new BadRequestException({
        message: 'Mentorship task does not exist',
        field: 'mentorshipTaskId',
      });
    }
    const newTodo = await this.todoModel.create({
      description: createTodoDto.description,
      taskId: createTodoDto.mentorshipTaskId,
    });

    this.logger.log(
      `Updating todo array in task, taskId: ${createTodoDto.mentorshipTaskId}, todoId: ${newTodo._id}`
    );
    const newTaskTodos = [...task.todo, newTodo._id];

    await this.mentorshipTasksService.findOneAndUpdate(
      createTodoDto.mentorshipTaskId,
      {
        todo: newTaskTodos,
      }
    );

    return newTodo;
  } */

  async updateTodo(todoId: string, updateTodoDto: UpdateTodoDto) {
    this.logger.log(`updating todo: ${todoId}`);

    return await this.todoModel.findOneAndUpdate(
      { _id: todoId },
      {
        description: updateTodoDto.description,
        isCompleted: updateTodoDto.isCompleted,
      }
    );
  }

  /*  async deleteTodo(todoId: string) {
    this.logger.log(`deleting todo: ${todoId}`);

    
    return await this.todoModel.findOneAndDelete({ _id: todoId });
  } */

  async findOne(todoId: string) {
    this.logger.error(`fetching todo: ${todoId}`);
    const todo = await this.todoModel.findById(todoId);

    if (!todo) {
      this.logger.error(`Todo does not exist: ${todoId}`);
      throw new BadRequestException(`Todo does not exist: ${todoId}`);
    }

    return todo;
  }
}
