import {
  Body,
  Controller,
  Param,
  Patch,
  //Post,
  UseGuards,
} from '@nestjs/common';
import { TaskTodosService } from './task-todos.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
/* import { CreateTodoDto } from './dto/create-todo.dto'; */
import { UpdateTodoDto } from './dto/update-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TaskTodosController {
  constructor(private readonly todoservice: TaskTodosService) {}

  /*   @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    return await this.todoservice.create(createTodoDto);
  } */

  @Patch(':id')
  async updateTodo(
    @Param('id') todoId: string,
    @Body() updateTodoDto: UpdateTodoDto
  ) {
    return await this.todoservice.updateTodo(todoId, updateTodoDto);
  }

  /*   @Delete(':id')
  async deleteTodo(@Param('id') todoId: string) {
    return await this.todoservice.deleteTodo(todoId);
  } */
}
