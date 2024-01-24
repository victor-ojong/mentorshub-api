import { RoleGuard } from '@app/common/guards/rolesGuard/roles.guard';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
  ValidationPipe,
  Param,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { MentorshipTasksService } from './mentorship-tasks.service';
import { CreateMentorshipTaskDto } from './dto/create-mentoship-task.dto';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UpdateMentorshipTaskDto } from './dto/update-mentorship-task.dto';
import { Roles } from '@app/common/guards/rolesGuard/roles.decorator';
import { AccountType } from '@app/common/enum/AccountType';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const basePath = 'tasks';
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('')
export class MentorshipTasksController {
  constructor(private readonly mentorshipTaskService: MentorshipTasksService) {}

  @Post(basePath)
  @Roles(AccountType.MENTOR)
  async create(
    @Body() createMentorshipDto: CreateMentorshipTaskDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    const mentorId = req.user._id;

    return await this.mentorshipTaskService.create(
      createMentorshipDto,
      mentorId
    );
  }

  @Get(`mentorship-goals/:id/${basePath}`)
  async findTasks(@Param('id') goalId: string) {
    return await this.mentorshipTaskService.findMentorshipTasksByGoalId(goalId);
  }

  @Patch(`${basePath}/:id`)
  async update(
    @Param('id') taskId: string,
    @Body(new ValidationPipe())
    updateMentorshipTaskDto: UpdateMentorshipTaskDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    return await this.mentorshipTaskService.updateMentorshipTask(
      taskId,
      updateMentorshipTaskDto,
      req.user._id,
      req.user.accountType
    );
  }

  @Post(`${basePath}/:taskId/todo`)
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @Param('taskId') taskId: string
  ) {
    return await this.mentorshipTaskService.createTodo(taskId, createTodoDto);
  }

  @Put(`${basePath}/:taskId/todo/:todoId`)
  async updateTodo(
    @Body() updateTodoDto: UpdateTodoDto,
    @Param() params: { todoId: string; taskId: string }
  ) {
    return await this.mentorshipTaskService.updateTodo({
      ...params,
      updateTodoDto,
    });
  }

  /* @Get(':id/stat')
  async getStat(@Param('id') id: string) {
    return await this.mentorshipTaskService.getStatusStatistic(id);
  } */
}
