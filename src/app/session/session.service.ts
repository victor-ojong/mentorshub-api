import {
  BadRequestException,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MentorshipSession, MentorshipSessionDocument } from './session.schema';
import { Model } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  Availability,
  RequestedDate,
  availabilityDateCheckerPath,
  isAvailable,
} from '@app/lib/availabiltyDateChecker';
import { UpdateSsessionDto } from './dto/update-session.dto';
import { TwilioService } from '@app/gateway/email/providers/twilio/twilio.service';
import { EmailHelper } from '@app/common/helpers/email.helper';
import { MentorMenteeDto } from '@app/common/dto/mentor-mentee.dto';
import { AvailabilityService } from '../availability/availability.service';
import { AvailabilityDocument } from '../availability/availability.schema';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionStatus } from '@app/common/enum/subscriptionStatus';
import { SubscriptionDocument } from '../subscriptions/subscriptions.schema';

type UpdateMentorAvailability = {
  mentorAvailability: Partial<AvailabilityDocument>;
  requestedDates: {
    date: string;
    time: string;
  }[];
};

@Injectable()
export class SessionService {
  private logger = new Logger(SessionService.name);
  constructor(
    @InjectModel(MentorshipSession.name)
    private sessionModel: Model<MentorshipSessionDocument>,
    private emailService: EmailHelper,
    private tiwilioService: TwilioService,
    private availabilityService: AvailabilityService,
    private readonly subscriptionService: SubscriptionsService
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
    this.logger.log('Creating session', createSessionDto);

    //TODO Change this to check for mentorship program instead.

    // check if there is an active subscription for the mentor, mentee and mentorship
    const subscription = await this.checkSubscription({
      mentee: createSessionDto.menteeId,
      mentor: createSessionDto.mentorId,
      mentorship: createSessionDto.mentorshipId,
      status: SubscriptionStatus.ACTIVE,
    });

    // check if mentee has not exhausted the sessionCount
    const requestedSessionDatesCount = createSessionDto.date.length;
    this.checkSessionCount(subscription, requestedSessionDatesCount);

    const mentorAvailability = await this.availabilityService.findOneByMentorId(
      createSessionDto.mentorId
    );

    console.log({ mentorAvailability });

    if (!availabilityDateCheckerPath(createSessionDto.date)) {
      throw new BadRequestException({
        message: 'Invalid dates provided. Dates must be in the future.',
        field: 'date',
      });
    }

    const mentorAvailableDates = mentorAvailability.availableDates;
    const sessionDates = createSessionDto.date;

    this.checkAvailability(sessionDates, mentorAvailableDates);

    await this.updateMentorAvailability({
      mentorAvailability,
      requestedDates: sessionDates,
    });
    const { token, roomName } = await this.tiwilioService.createRoomAndToken(
      createSessionDto.mentorId,
      createSessionDto.roomName
    );

    const session = await this.sessionModel.create({
      ...createSessionDto,
      token,
      roomName,
      menteeId: createSessionDto.menteeId,
      mentorId: createSessionDto.mentorId,
    });

    // update sessionCount by number of requestedSessionCount
    await this.subscriptionService.findOneAndUpdate(
      { _id: subscription._id },
      {
        usedSessionCount:
          subscription.usedSessionCount + requestedSessionDatesCount,
      }
    );
    // await this.emailService.sendEmail(
    //   'New session scheduled',
    //   'new-session',
    //   [mentor.email],
    //   { mentee, mentor }
    // );
    return session.toJSON();
  }

  async updateMentorshipSession(
    updateMentorshipSessionDto: UpdateSsessionDto,
    id: string
  ) {
    this.logger.log('Updating session', updateMentorshipSessionDto);

    const session = await this.sessionModel.findById(id);

    if (!session) {
      throw new BadRequestException({
        message: 'Session not found',
        field: 'session',
      });
    }

    if (updateMentorshipSessionDto.updateDate) {
      const mentorAvailability =
        await this.availabilityService.findOneByMentorId(
          session.mentorId.toString()
        );
      const sessionDates = updateMentorshipSessionDto.updateDate;
      this.checkAvailability(sessionDates, mentorAvailability.availableDates);

      try {
        await this.updateMentorAvailability({
          mentorAvailability,
          requestedDates: sessionDates,
        });
        return await this.sessionModel.findByIdAndUpdate(
          id,
          {
            $push: {
              date: {
                $each: updateMentorshipSessionDto.updateDate,
              },
            },
          },
          {
            new: true,
          }
        );
      } catch (error) {
        this.logger.log(error);
      }
    }

    return await this.sessionModel.findByIdAndUpdate(
      id,
      {
        status: updateMentorshipSessionDto.status,
      },
      {
        new: true,
      }
    );
  }

  private async updateMentorAvailability({
    mentorAvailability,
    requestedDates,
  }: UpdateMentorAvailability) {
    try {
      for (const requestedDate of requestedDates) {
        const index = mentorAvailability.availableDates.findIndex((dateObj) => {
          return (
            dateObj.date === requestedDate.date &&
            dateObj.time.some((time) => requestedDate.time.includes(time))
          );
        });

        if (index !== -1) {
          const dateObj = mentorAvailability.availableDates[index];
          if (dateObj.time.length > 1) {
            dateObj.time = dateObj.time.filter(
              (time) => !requestedDate.time.includes(time)
            );
            mentorAvailability.availableDates[index] = dateObj;
          } else {
            mentorAvailability.availableDates.splice(index, 1);
          }
        }
      }

      this.availabilityService.findOneAndUpdate(
        { _id: mentorAvailability._id },
        {
          availableDates: mentorAvailability.availableDates,
        }
      );
      return mentorAvailability?.toJSON?.();
    } catch (error) {
      this.logger.log(error);
    }
  }

  private checkAvailability(
    requestedDateTimeArray: RequestedDate[],
    mentorAvailability: Availability[]
  ) {
    if (!isAvailable(requestedDateTimeArray, mentorAvailability)) {
      throw new BadRequestException({
        message: 'Mentor is not available on the provided dates',
        field: 'date',
      });
    }
  }

  private async checkSubscription(payload: {
    mentee: string;
    mentor: string;
    mentorship: string;
    status: SubscriptionStatus;
  }) {
    const subscription = await this.subscriptionService.findOne(payload);

    if (!subscription) {
      this.logger.log(
        `Mentee: ${payload.mentee} does not have an active subscription with the mentor: ${payload.mentor}.`
      );
      throw new PreconditionFailedException({
        message: `Mentee ${payload.mentee} does not have an active subscription with the mentor${payload.mentor}.`,
      });
    }

    return subscription;
  }

  private checkSessionCount(
    subscription: SubscriptionDocument,
    requestedSessionDatesCount: number
  ) {
    const unUsedSessionCounts =
      subscription.sessionCount - subscription.usedSessionCount;

    if (requestedSessionDatesCount > unUsedSessionCounts) {
      this.logger.log(
        `The allowed session count (${unUsedSessionCounts}) left for your subscription: ${subscription._id}, can not accommodate the number of requested sessions: ${requestedSessionDatesCount}`
      );
      throw new PreconditionFailedException(
        `The allowed session count (${unUsedSessionCounts}) left for your subscription: ${subscription._id}, can not accommodate the number of requested sessions: ${requestedSessionDatesCount}`
      );
    }
  }
  async checkMentorshipSession(mentorMenteeDto: MentorMenteeDto) {
    this.logger.log('Checking mentorship session', mentorMenteeDto);
    const session = await this.findOne(mentorMenteeDto);

    if (!session) {
      throw new BadRequestException(
        'Mentorship session does not exist, create a mentorship session for the provided mentee'
      );
    }
    return session;
  }

  async findOne(mentorMenteeDto: MentorMenteeDto) {
    return await this.sessionModel.findOne({
      menteeId: mentorMenteeDto.menteeId,
      mentorId: mentorMenteeDto.mentorId,
    });
  }
}
