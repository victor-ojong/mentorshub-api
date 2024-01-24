import { Module } from '@nestjs/common';
import { TaskTodosController } from './task-todos.controller';
import { TaskTodosService } from './task-todos.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './task-todos.schema';
import { MentorshipTasksModule } from '../mentorship-tasks/mentorship-tasks.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Todo.name,
        schema: TodoSchema,
      },
    ]),
    MentorshipTasksModule,
  ],
  controllers: [TaskTodosController],
  providers: [TaskTodosService],
})
export class TaskTodosModule {}
