import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MentorshipGoal,
  MentorshipGoalDocument,
} from './mentorship-goals.schema';
import { Model } from 'mongoose';
import {
  CreateMentorshipGoalDto,
  CreateMultipleMentorshipGoalDto,
} from './dto/create-mentorship-goal.dto';
import { GetMentorshipGoalDto } from './dto/get-mentorship-goals.dto';
import { UpdateMentorshipGoalDto } from './dto/update-mentorship-goal.dto';
import { MentorshipService } from '../mentorship/mentorship.service';
import { SessionService } from '../session/session.service';
import { MentorshipTasksService } from '../mentorship-tasks/mentorship-tasks.service';
import { MentorshipType } from '@app/common/enum/MentorshipType';

@Injectable()
export class MentorshipGoalsService {
  private logger = new Logger(MentorshipGoalsService.name);

  constructor(
    @InjectModel(MentorshipGoal.name)
    private readonly mentorshipGoalModel: Model<MentorshipGoalDocument>,
    private readonly mentorshipService: MentorshipService,
    private readonly sessionService: SessionService,

    @Inject(forwardRef(() => MentorshipTasksService))
    private readonly mentorshipTaskService: MentorshipTasksService
  ) {}

  async create(
    createMentorshipGoal: CreateMentorshipGoalDto,
    mentorId: string
  ) {
    this.logger.log('creating mentorship goal', {
      ...createMentorshipGoal,
      mentorId,
    });

    const mentorship = await this.mentorshipService.isMentorshipExist({
      ...createMentorshipGoal,
      mentorId,
    });
    //check if mentorship exist
    if (!mentorship) {
      throw new BadRequestException(
        'Mentorship does not exist, create a mentorship program for the provided mentee'
      );
    }

    if (mentorship.mentorshipType !== MentorshipType.AI) {
      // check if session exist
      await this.sessionService.checkMentorshipSession({
        menteeId: createMentorshipGoal.menteeId,
        mentorId,
      });
    }

    // create mentorship goal
    const newGoal = await this.mentorshipGoalModel.create({
      mentee: createMentorshipGoal.menteeId,
      mentor: mentorId,
      description: createMentorshipGoal.description,
      title: createMentorshipGoal.title,
      subtitle: createMentorshipGoal.subtitle,
      mentorshipId: createMentorshipGoal.mentorshipId,
    });

    if (createMentorshipGoal.tasks) {
      await this.mentorshipTaskService.createMultipleTasks(
        {
          tasks: createMentorshipGoal.tasks,
          mentorshipGoalId: newGoal._id.toString(),
          menteeId: createMentorshipGoal.menteeId,
        },
        mentorId
      );
    }

    return newGoal;
  }

  async createMultipleGoals(
    createMultipleGoalsDto: CreateMultipleMentorshipGoalDto,
    mentorId: string
  ) {
    this.logger.log('creating multiple goals for a mentorship program', {
      ...createMultipleGoalsDto,
      mentorId,
    });

    const mentorship = await this.mentorshipService.isMentorshipExist({
      menteeId: createMultipleGoalsDto.menteeId.toString(),
      mentorId,
    });

    //check if mentorship exist
    if (!mentorship) {
      throw new BadRequestException(
        'Mentorship does not exist, create a mentorship program for the provided mentee'
      );
    }
    if (mentorship.mentorshipType !== MentorshipType.AI) {
      // check if session exist
      await this.sessionService.checkMentorshipSession({
        menteeId: createMultipleGoalsDto.menteeId,
        mentorId,
      });
    }

    const goals = createMultipleGoalsDto.goals.map((goal) => ({
      mentee: createMultipleGoalsDto.menteeId.toString(),
      mentor: mentorId,
      description: goal.description,
      title: goal.title,
      subtitle: goal.subtitle ?? '',
      mentorshipId: createMultipleGoalsDto.mentorshipId,
    }));

    const newGoals = await this.mentorshipGoalModel.create(goals);

    // this is how multiple tasks is being handled a multiple goal creation

    for (const goalIndex in createMultipleGoalsDto.goals) {
      const goal = createMultipleGoalsDto.goals[goalIndex];
      if (goal.tasks) {
        await this.mentorshipTaskService.createMultipleTasks(
          {
            tasks: goal.tasks,
            menteeId: createMultipleGoalsDto.menteeId.toString(),
            mentorshipGoalId: newGoals[goalIndex]._id.toString(),
          },
          mentorId
        );
      }
    }

    return newGoals;
  }

  async findMentorshipGoal(
    getMentorshipGoalDto: GetMentorshipGoalDto,
    userId: string,
    accountType: string
  ) {
    const mentorshipGoals = await this.mentorshipGoalModel
      .find({
        mentorshipId: getMentorshipGoalDto.mentorshipId,
        [accountType]: userId,
      })
      .populate('task')
      .populate('mentee')
      .populate('mentor');

    return mentorshipGoals;
  }

  async update(
    id: string,
    updateMentorshipGoalDto: UpdateMentorshipGoalDto,
    userId: string
  ) {
    this.logger.log('updating mentorship goal', {
      ...updateMentorshipGoalDto,
      userId,
    });

    const result = await this.mentorshipGoalModel.findOneAndUpdate(
      { _id: id, mentor: userId },
      {
        title: updateMentorshipGoalDto.title,
        subtitle: updateMentorshipGoalDto.subtitle,
        description: updateMentorshipGoalDto.description,
        status: updateMentorshipGoalDto.status,
      },
      { new: true, runValidators: true }
    );

    return result;
  }

  async findOne(mentorshipGoalId: string, mentorId: string) {
    return this.mentorshipGoalModel.findOne({
      _id: mentorshipGoalId,
      mentor: mentorId,
    });
  }

  async findOneAndUpdate(
    mentorshipGoalId: string,
    updateMentorshipGoalDto: UpdateMentorshipGoalDto & { dueDate?: Date }
  ) {
    return await this.mentorshipGoalModel.findByIdAndUpdate(
      mentorshipGoalId,
      {
        title: updateMentorshipGoalDto.title,
        subtitle: updateMentorshipGoalDto.subtitle,
        description: updateMentorshipGoalDto.description,
        dueDate: updateMentorshipGoalDto.dueDate,
        task: updateMentorshipGoalDto.task,
        status: updateMentorshipGoalDto.status,
      },
      { new: true, omitUndefined: true }
    );
  }
}
