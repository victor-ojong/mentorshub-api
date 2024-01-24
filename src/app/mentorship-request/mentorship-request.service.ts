import { PaginatedResult, Pagination } from '@app/lib/pagination.lib';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { omit } from 'ramda';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { FindMentorshipRequestDto } from './dto/find-mentorship-requests.dto';
import { EmailHelper } from '../../common/helpers/email.helper';
import {
  MentorshipRequest,
  MentorshipRequestDocument,
  MentorshipRequestStatus,
} from './mentorship-request.schema';
import { MentorshipGroupService } from '../mentorship-group/mentorship-group.service';
import { JwtPayload } from '../authentication/authentication.constant';
import { printObject } from '@app/lib/utils.lib';
import { MentorMenteeDto } from '@app/common/dto/mentor-mentee.dto';

@Injectable()
export class MentorshipRequestService {
  private logger = new Logger(MentorshipRequestService.name);

  constructor(
    @InjectModel(MentorshipRequest.name)
    private mentorshipRequestModel: Model<MentorshipRequestDocument>,
    private userService: UserService,
    private emailService: EmailHelper,
    private mentorsipGroupService: MentorshipGroupService
  ) {}

  async checkMentorAndMenteeExists(mentorMenteeDto: MentorMenteeDto) {
    // anyone can seek mentorship irrespective of the user type
    const mentee = await this.userService.findOne({
      _id: mentorMenteeDto.menteeId as any,
    });
    if (!mentee) {
      throw new BadRequestException({
        message: 'Mentee not found with the provided menteeId',
        field: 'menteeId',
      });
    }
    const mentor = await this.userService.findOne({
      _id: mentorMenteeDto.mentorId as any,
      accountType: 'mentor',
    });
    if (!mentor) {
      throw new BadRequestException({
        message: 'Mentor not found with the provided mentorId',
        field: 'mentorId',
      });
    }

    return { mentor, mentee };
  }

  async create(createMentorshipRequestDto: CreateMentorshipRequestDto) {
    this.logger.log('creating mentorship requests', createMentorshipRequestDto);

    const { mentee, mentor } = await this.checkMentorAndMenteeExists(
      createMentorshipRequestDto
    );

    const existingRequest = await this.mentorshipRequestModel.findOne({
      mentee: createMentorshipRequestDto.menteeId,
      mentor: createMentorshipRequestDto.mentorId,
      acceptanceStatus: MentorshipRequestStatus.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException({
        message: 'You already have a pending request with this mentor',
        field: 'mentorId',
      });
    }

    const requested = await this.mentorshipRequestModel.create({
      mentee: createMentorshipRequestDto.menteeId,
      mentor: createMentorshipRequestDto.mentorId,
      proficiencyLevel: createMentorshipRequestDto.proficiencyLevel,
      growthAreas: createMentorshipRequestDto.growthAreas,
    });
    await this.notifyMentorOfRequest(mentee, mentor);
    return requested;
  }

  async requestAccepted({
    menteeId,
    mentorId,
    acceptanceStatus,
  }: {
    mentorId: string;
    menteeId: string;
    acceptanceStatus: MentorshipRequestStatus;
  }) {
    return await this.mentorshipRequestModel.findOne({
      mentee: menteeId,
      mentor: mentorId,
      acceptanceStatus: acceptanceStatus,
      confirmationStatus: acceptanceStatus,
    });
  }

  //
  async notifyMentorOfRequest(mentee: User, mentor: User) {
    this.logger.log('notifying mentor of mentorship requests');
    await this.emailService.sendEmail(
      'New mentorship request',
      'mentorship-request',
      [mentor.email],
      { mentor, mentee }
    );
  }

  async findAll(dto: FindMentorshipRequestDto) {
    this.logger.log('fetching mentorship requests - data -', { dto });
    const options = dto.options;
    const query = omit(['options'], dto);
    const paginationOptions = new Pagination(options.page, options.perPage);
    const [result, total] = await Promise.all([
      this.mentorshipRequestModel
        .find(query)
        .sort(options.sort || { createdAt: 'descending' })
        .limit(paginationOptions.perPage)
        .skip(paginationOptions.skip),
      this.mentorshipRequestModel.count(query),
    ]);
    return PaginatedResult.create(result, total, paginationOptions);
  }

  async findOne(id: string) {
    this.logger.log('fetching mentorship requests by id - %o', id);
    try {
      const user = await this.mentorshipRequestModel
        .findById(id)
        .populate('mentorship');
      return user?.toJSON();
    } catch (error) {
      this.logger.error(`Error fetching user - error - ${printObject(error)}`);
      throw error;
    }
  }

  async accept(id: string, auth: JwtPayload) {
    this.logger.log('accepting mentorship request', { id, auth });
    const accepted = (
      await this.mentorshipRequestModel
        .findOneAndUpdate(
          {
            _id: id as any,
            mentor: auth.id,
            acceptanceStatus: MentorshipRequestStatus.PENDING,
          },
          { acceptanceStatus: MentorshipRequestStatus.ACCEPTED }
        )
        .populate('mentor')
        .populate('mentee')
    )?.toJSON();

    if (accepted) {
      const mentor = accepted.mentor as User,
        mentee = accepted.mentee as User;
      await this.emailService.sendEmail(
        'Mentorship request accepted',
        'mentorship-request-accepted',
        [mentee.email],
        { mentor, mentee }
      );
      return accepted;
    }
  }

  async reject(id: string, auth: JwtPayload) {
    this.logger.log('rejecting mentorship request', { id, auth });
    // the user rejecting must be the mentor
    const rejected = (
      await this.mentorshipRequestModel
        .findOneAndUpdate(
          {
            _id: id as any,
            mentor: auth.sub,
            acceptanceStatus: MentorshipRequestStatus.PENDING,
          },
          { acceptanceStatus: MentorshipRequestStatus.REJECTED }
        )
        .populate('mentor')
        .populate('mentee')
    )?.toJSON();

    if (rejected) {
      const mentor = rejected.mentor as User,
        mentee = rejected.mentee as User;
      await this.emailService.sendEmail(
        'Mentorship request rejected',
        'mentorship-request-rejected',
        [mentee.email],
        { mentor, mentee }
      );
    }
  }

  async cancel(id: string, auth: JwtPayload) {
    this.logger.log('accepting mentorship request', { id, auth });
    // the user cancelling must be the mentee, the user that requested
    const cancelled = (
      await this.mentorshipRequestModel
        .findOneAndUpdate(
          {
            _id: id as unknown,
            mentee: auth.sub,
            acceptanceStatus: {
              $in: [
                MentorshipRequestStatus.PENDING,
                MentorshipRequestStatus.ACCEPTED,
              ],
            },
          },
          { acceptanceStatus: MentorshipRequestStatus.CANCELLED }
        )
        .populate('mentor')
        .populate('mentee')
    )?.toJSON();

    if (cancelled) {
      const mentor = cancelled.mentor as User,
        mentee = cancelled.mentee as User;
      if (cancelled.mentorshipGroup) {
        await this.mentorsipGroupService.delete(
          cancelled.mentorshipGroup as string
        );
        await this.mentorshipRequestModel.findByIdAndUpdate(cancelled.id, {
          mentorshipGroup: null,
        });
      }
      await this.emailService.sendEmail(
        'Mentorship request cancelled',
        'mentorship-request-cencelled',
        [mentee.email],
        { mentor, mentee }
      );
    }
  }

  async confirmAcceptance(requestId: string, auth: JwtPayload) {
    this.logger.log('confirming request acceptance');
    const request = await this.mentorshipRequestModel.findOne({
      _id: requestId,
      mentee: auth.id,
      acceptanceStatus: MentorshipRequestStatus.ACCEPTED,
      confirmationStatus: MentorshipRequestStatus.PENDING,
    });

    //TODO: if mentorship is found, check the status and send

    if (!request) {
      throw new BadRequestException('mentorship request not found');
    }

    await this.mentorshipRequestModel.findByIdAndUpdate(requestId, {
      confirmationStatus: MentorshipRequestStatus.ACCEPTED,
    });

    await this.mentorshipRequestModel.updateMany(
      {
        mentee: auth.id,
        acceptanceStatus: MentorshipRequestStatus.ACCEPTED,
        _id: { $ne: requestId },
      },
      {
        confirmationStatus: MentorshipRequestStatus.REJECTED,
      }
    );

    await this.mentorshipRequestModel.updateMany(
      {
        mentee: auth.id,
        acceptanceStatus: { $ne: MentorshipRequestStatus.ACCEPTED },
      },
      {
        confirmationStatus: MentorshipRequestStatus.CANCELLED,
      }
    );
    return {
      success: true,
    };
  }

  async update(
    id: number,
    updateMentorshipRequestDto: Partial<
      MentorshipRequest | MentorshipRequestDocument
    >
  ) {
    this.logger.log('updating mentorship request with data ', {
      id,
      updateMentorshipRequestDto,
    });
    return await this.mentorshipRequestModel.findByIdAndUpdate(
      id,
      updateMentorshipRequestDto
    );
  }

  async remove(id: number) {
    this.logger.log('deleting mentorship request with data', { id });
    return await this.mentorshipRequestModel.deleteOne({ id });
  }
}
