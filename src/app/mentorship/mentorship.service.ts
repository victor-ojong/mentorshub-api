import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateMentorshipDto } from './dto/create-mentorship.dto';
import { Mentorship, MentorshipDocument } from './mentorship.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MentorMenteeDto } from '@app/common/dto/mentor-mentee.dto';
import { UserService } from '../user/user.service';
import { AccountType } from '@app/common/enum/AccountType';
import { User } from '../user/user.schema';
import { EmailHelper } from '../../common/helpers/email.helper';
import { FindMentorshipDto } from './dto/find-mentorship.dto';
import { omit } from 'ramda';
import { PaginatedResult, Pagination } from '@app/lib/pagination.lib';
import { UpdateMentorshipDto } from './dto/update-mentorship.dto';
import { UserWithId } from '@app/common/enum/RequestUser';
import { MentorshipType } from '@app/common/enum/MentorshipType';

@Injectable()
export class MentorshipService {
  private logger = new Logger(MentorshipService.name);

  constructor(
    @InjectModel(Mentorship.name)
    private mentorshipModel: Model<MentorshipDocument>,
    private readonly userService: UserService,
    private emailService: EmailHelper
  ) {}

  async checkMentorAndMenteeExists(mentorMenteeDto: MentorMenteeDto) {
    // anyone can seek mentorship irrespective of the user type
    const mentee = await this.userService.findOne({
      _id: new mongoose.Types.ObjectId(mentorMenteeDto.menteeId),
    });

    this.logger.log('Checking if mentor and mentee exist');
    if (!mentee) {
      throw new BadRequestException({
        message: 'Mentee not found with the provided menteeId',
        field: 'menteeId',
      });
    }

    const mentor = await this.userService.findOne({
      _id: new mongoose.Types.ObjectId(mentorMenteeDto.mentorId),
      accountType: AccountType.MENTOR,
    });

    if (!mentor) {
      throw new BadRequestException({
        message: 'Mentor not found with the provided mentorId',
        field: 'mentorId',
      });
    }
    this.logger.log(
      `Confirmed: mentee and mentor exist. mentee: ${mentorMenteeDto.menteeId}, mentor: ${mentorMenteeDto.mentorId}`
    );
    return { mentor, mentee };
  }

  async isMentorshipExist(
    payload: MentorMenteeDto & {
      mentorshipId?: string;
    }
  ) {
    this.logger.log('checking if mentorship exist', payload);
    console.log(payload, 'payload');
    const { menteeId, mentorId, mentorshipId } = payload;

    await this.checkMentorAndMenteeExists({
      menteeId,
      mentorId,
    });

    let mentorship: MentorshipDocument;
    if (mentorshipId) {
      mentorship = await this.mentorshipModel.findById(mentorshipId);
    } else {
      mentorship = await this.mentorshipModel.findOne({
        mentee: menteeId,
        mentor: mentorId,
      });
    }

    this.logger.log(
      mentorship
        ? `mentorship exist, ${payload}`
        : `mentorship does not exist, ${payload}`
    );

    if (!mentorship) {
      throw new BadRequestException('Mentorship does not exist');
    }

    if (mentorship.mentee.toString() !== menteeId.toString()) {
      throw new BadRequestException(
        'Mentorship is not assigned to the provided menteeId'
      );
    }

    if (mentorship.mentor.toString() !== mentorId.toString()) {
      throw new BadRequestException(
        'Mentorship is not assigned to the provided mentorId'
      );
    }

    return mentorship;
  }

  async notifyMentorOfRequest(mentee: User, mentor: User) {
    this.logger.log('notifying mentor of mentorship requests');
    await this.emailService.sendEmail(
      'New mentorship request',
      'mentorship-request',
      [mentor.email],
      { mentor, mentee }
    );
  }

  async create(
    createMentorshipDto: CreateMentorshipDto & {
      menteeId: string;
      mentorshipType?: MentorshipType;
    }
  ) {
    const { menteeId, mentorId } = createMentorshipDto;

    if (menteeId === mentorId) {
      this.logger.log(
        `Mentorship can not be created, menteeId : ${menteeId} and mentorId: ${mentorId} are the same`
      );
      throw new BadRequestException(
        'Mentorship can not be created. Mentor and mentee must be distinct'
      );
    }

    const existingMentorship = await this.mentorshipModel.findOne({
      mentee: menteeId,
      mentor: mentorId,
    });

    if (existingMentorship) {
      this.logger.log(
        `Mentorship exist, mentee: ${menteeId} mentor: ${mentorId}`
      );
      return existingMentorship;
    }

    const { mentor, mentee } = await this.checkMentorAndMenteeExists({
      mentorId,
      menteeId,
    });

    const newMentorship = await this.mentorshipModel.create({
      mentee: createMentorshipDto.menteeId,
      mentor: createMentorshipDto.mentorId,
      proficiencyLevel: createMentorshipDto.proficiencyLevel,
      mentorshipType: createMentorshipDto.mentorshipType,
      growthAreas: createMentorshipDto.growthAreas,
    });

    await this.notifyMentorOfRequest(mentee, mentor);

    return newMentorship;
  }

  async findAll(
    dto: FindMentorshipDto,
    userId: string,
    accountType: AccountType
  ) {
    dto[accountType] = userId;

    this.logger.log('fetching mentorship - data -', { dto });
    const options = dto.options;
    const query = omit(['options'], dto);
    const paginationOptions = new Pagination(options?.page, options?.perPage);
    const [result, total] = await Promise.all([
      this.mentorshipModel
        .find(query)
        .sort(options?.sort || { createdAt: 'descending' })
        .limit(paginationOptions.perPage)
        .skip(paginationOptions.skip),
      this.mentorshipModel.count(query),
    ]);
    return PaginatedResult.create(result, total, paginationOptions);
  }

  async findOne(
    mentorshipId: string,
    userId: string | mongoose.Types.ObjectId
  ) {
    this.logger.log(
      `Find one mentorship. userId: ${userId}, mentorshipId: ${mentorshipId}`
    );
    const mentorship = await this.mentorshipModel
      .findById(mentorshipId)
      .populate('mentee')
      .populate('mentor');

    if (!mentorship) {
      this.logger.log(
        `Mentorship not found. userId: ${userId}, mentorshipId: ${mentorshipId}`
      );
      throw new BadRequestException(`Mentorship not found`);
    }

    const mentee = mentorship.mentee as UserWithId;
    const mentor = mentorship.mentor as UserWithId;

    // if user is not a mentee or mentor to this mentorship
    if (!mentee._id.equals(userId) && !mentor._id.equals(userId)) {
      this.logger.log(
        `user is not assigned to this mentorship. userId: ${userId}, mentorshipId: ${mentorshipId}`
      );
      throw new BadRequestException('user is not assigned to this mentorship');
    }

    return mentorship;
  }

  async update(payload: {
    mentorshipId: string;
    userId: mongoose.Types.ObjectId;
    updateMentorshipDto: UpdateMentorshipDto;
  }) {
    const { mentorshipId, userId, updateMentorshipDto } = payload;

    const updatedMentorship = await this.mentorshipModel.findOneAndUpdate(
      {
        _id: mentorshipId,
        mentee: userId,
      },
      {
        growthAreas: updateMentorshipDto.growthAreas,
        proficiencyLevel: updateMentorshipDto.proficiencyLevel,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMentorship) {
      this.logger.log(
        `mentorship can not be updated, Mentorship not found ${mentorshipId}, user: ${userId}`
      );
      throw new BadRequestException(
        `Mentorship not found ${mentorshipId}, user: ${userId}`
      );
    }

    return updatedMentorship;
  }

  async updateProgressPercent(mentorshipId: string, progressPercent: number) {
    return await this.mentorshipModel.findByIdAndUpdate(
      mentorshipId,
      {
        $set: { progressPercent: progressPercent },
      },
      { new: true, runValidators: true }
    );
  }
}
