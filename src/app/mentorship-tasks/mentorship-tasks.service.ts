import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './mentorship-tasks.schema';
import {
  CreateMentorshipTaskDto,
  CreateMultipleMentorshipTaskDto,
} from './dto/create-mentoship-task.dto';
import { AccountType } from '@app/common/enum/AccountType';
import { UpdateMentorshipTaskDto } from './dto/update-mentorship-task.dto';
import { MentorshipGoalsService } from '../mentorship-goals/mentorship-goals.service';
import mongoose, { Model } from 'mongoose';
import { ALLOWEDTASKCOUNT } from '@app/common/enum/TaskStatus';
import { getDueDatesFromDuration } from '@app/common/functions/getDueDateFromDuration';
import { MentorshipGoalDocument } from '../mentorship-goals/mentorship-goals.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class MentorshipTasksService {
  private logger = new Logger(MentorshipTasksService.name);

  constructor(
    @InjectModel(Task.name)
    private readonly mentorshipTaskModel: Model<TaskDocument>,
    @Inject(forwardRef(() => MentorshipGoalsService))
    private readonly mentorshipGoalsService: MentorshipGoalsService
  ) {}

  async create(createMentorshipTaskDto: CreateMentorshipTaskDto, mentorId) {
    const mentorshipGoal = await this.verifyMentorshipGoal({
      ...createMentorshipTaskDto,
      mentorId,
    });

    this.logger.log(
      `Creating a single task mentee: ${createMentorshipTaskDto.menteeId}, mentor:${mentorId}`
    );
    // creat task
    const mentorshipTask = await this.mentorshipTaskModel.create({
      mentee: createMentorshipTaskDto.menteeId,
      mentor: mentorId,
      mentorshipGoalId: createMentorshipTaskDto.mentorshipGoalId,
      title: createMentorshipTaskDto.title,
      description: createMentorshipTaskDto.description,
      dueDate: getDueDatesFromDuration(createMentorshipTaskDto.duration),
      duration: createMentorshipTaskDto.duration,
    });

    await this.updateGoalWithTask(mentorshipTask, mentorshipGoal);

    return mentorshipTask;
  }

  async createMultipleTasks(
    createMultipleMentorshipTaskDto: CreateMultipleMentorshipTaskDto,
    mentorId: string
  ) {
    const mentorshipGoal = await this.verifyMentorshipGoal({
      ...createMultipleMentorshipTaskDto,
      mentorId,
    });

    this.logger.log(
      `Creating multiple tasks for mentee ${createMultipleMentorshipTaskDto.menteeId}`
    );

    const tasks = createMultipleMentorshipTaskDto.tasks.map((task) => ({
      mentee: createMultipleMentorshipTaskDto.menteeId,
      mentor: mentorId,
      mentorshipGoalId: createMultipleMentorshipTaskDto.mentorshipGoalId,
      title: task.title,
      description: task.description,
      dueDate: getDueDatesFromDuration(task.duration),
      duration: task.duration,
    }));

    const newTasks = await this.mentorshipTaskModel.create(tasks);

    await this.updateGoalWithTask(newTasks, mentorshipGoal);

    return newTasks;
  }

  async findMentorshipTasksByGoalId(goalId: string) {
    const mentorshipTasks = await this.mentorshipTaskModel
      .find({
        mentorshipGoalId: goalId,
      })
      .populate('mentee')
      .populate('mentor');

    return mentorshipTasks;
  }

  async updateMentorshipTask(
    taskId: string,
    updateMentorshipTaskDto: UpdateMentorshipTaskDto,
    userId: string,
    accountType: AccountType
  ) {
    this.logger.log('updating mentorship task', {
      ...updateMentorshipTaskDto,
      userId,
    });

    // mentor can update all props, mentee can only update status
    let payload: UpdateMentorshipTaskDto & { dueDate?: Date };
    if (accountType === AccountType.MENTEE) {
      payload = { status: updateMentorshipTaskDto.status };
    } else if (accountType === AccountType.MENTOR) {
      payload = {
        status: updateMentorshipTaskDto.status,
        title: updateMentorshipTaskDto.title,
        description: updateMentorshipTaskDto.description,
        dueDate: getDueDatesFromDuration(updateMentorshipTaskDto.duration),
        duration: updateMentorshipTaskDto.duration,
      };
    }

    const updatedTask = await this.mentorshipTaskModel.findOneAndUpdate(
      { _id: taskId, [accountType]: userId },
      payload,
      { new: true, runValidators: true }
    );

    return updatedTask;
  }

  async findOne(taskId: string) {
    return await this.mentorshipTaskModel.findById(taskId);
  }

  async getStatusStatistic(mentorshipGoalId: string) {
    return await this.mentorshipTaskModel.aggregate([
      {
        $match: {
          mentorshipGoalId: new mongoose.Types.ObjectId(mentorshipGoalId),
        },
      },
      { $group: { _id: '$status', total: { $sum: 1 } } },
      { $addFields: { status: '$_id', count: '$total' } },
      { $project: { _id: 0, total: 0 } },
    ]);
  }

  async findOneAndUpdate(
    taskId: string,
    updateMentorshipTaskDto: UpdateMentorshipTaskDto
  ) {
    return await this.mentorshipTaskModel.findByIdAndUpdate(
      taskId,
      {
        title: updateMentorshipTaskDto.title,
        description: updateMentorshipTaskDto.description,
        dueDate: getDueDatesFromDuration(updateMentorshipTaskDto.duration),
        duration: updateMentorshipTaskDto.duration,
        todo: updateMentorshipTaskDto.todo,
        status: updateMentorshipTaskDto.status,
      },
      { new: true }
    );
  }

  async createTodo(taskId: string, createTodoDto: CreateTodoDto) {
    const task = await this.mentorshipTaskModel.findById(taskId);

    task.todos.push(createTodoDto);

    const updatedTask = await task.save();

    return updatedTask.todos[0];
  }

  async updateTodo({
    taskId,
    todoId,
    updateTodoDto,
  }: {
    taskId: string;
    todoId: string;
    updateTodoDto: UpdateTodoDto;
  }) {
    const updatedTask = await this.mentorshipTaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: {
          'todos.$[element].description': updateTodoDto.description,
          'todos.$[element].isCompleted': updateTodoDto.isCompleted,
        },
      },
      {
        arrayFilters: [{ 'element._id': todoId }],
        new: true,
      }
    );

    return updatedTask.todos;
  }

  private async updateGoalWithTask(
    newTasks: TaskDocument[] | TaskDocument,
    mentorshipGoal: MentorshipGoalDocument
  ) {
    const newTaskIds = Array.isArray(newTasks)
      ? newTasks.map((task) => task._id)
      : [newTasks._id];

    this.logger.log(
      `Updating task array in mentorship Goal, mentorshipGoalId: ${mentorshipGoal._id}, taskIds: ${newTaskIds}`
    );

    return await this.mentorshipGoalsService.findOneAndUpdate(
      mentorshipGoal._id.toString(),
      {
        task: [...mentorshipGoal.task, ...newTaskIds],
      }
    );
  }

  private async verifyMentorshipGoal({
    menteeId,
    mentorId,
    mentorshipGoalId,
  }: {
    menteeId: string;
    mentorId: string;
    mentorshipGoalId: string;
  }) {
    const mentorshipGoal = await this.mentorshipGoalsService.findOne(
      mentorshipGoalId,
      mentorId
    );

    // check if Goal exist
    if (!mentorshipGoal) {
      throw new BadRequestException({
        message: 'Mentorship goal does not exist',
        field: 'mentoshipGoalId',
      });
    }

    // check if Goal belongs to mentee
    if (mentorshipGoal.mentee.toString() !== menteeId) {
      throw new BadRequestException({
        message: 'Mentorship goal does not belong to the provided menteeId',
        field: 'mentoshipGoalId, menteeId',
      });
    }

    // check if task has not exceeded allowed count
    if (mentorshipGoal.task.length >= ALLOWEDTASKCOUNT) {
      throw new BadRequestException({
        message: 'You have reached maximum number of Task for this Goal',
        field: 'mentoshipGoalId, menteeId',
      });
    }

    return mentorshipGoal;
  }
}
