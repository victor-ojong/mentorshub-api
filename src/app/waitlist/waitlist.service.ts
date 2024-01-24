import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Waitlist, WaitlistDocument } from './waitlist.schema';
import { Model } from 'mongoose';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { InjectQueue } from '@nestjs/bull';
import { queues } from '@app/queue/config.queue';
import { Queue } from 'bull';
import { EmailJob } from '@app/queue/jobs/email.job';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WaitlistService {
  private logger = new Logger(WaitlistService.name);
  constructor(
    @InjectModel(Waitlist.name)
    private waitlistModel: Model<WaitlistDocument>,
    @InjectQueue(queues.notification.name)
    private notificationQueue: Queue
  ) {}

  async joinWaitList(JoinWaitlistDto: JoinWaitlistDto) {
    try {
      const response = await this.waitlistModel.create({
        ...JoinWaitlistDto,
        isEmailVerified: true,
      });
      this.sendWaitListMail(JoinWaitlistDto);
      return response.toJSON();
    } catch (error: any) {
      if (error.code === 11000) {
        this.logger.error('Email is already in use.', { error });
        throw new HttpException(
          `Sorry ${JoinWaitlistDto.firstName} you have already been added to the waitlist`,
          HttpStatus.FORBIDDEN
        );
      } else {
        throw error;
      }
    }
  }
  sendWaitListMail(user: JoinWaitlistDto) {
    const emailJob = new EmailJob({
      subject: 'Waitlist',
      body: {
        templateName: 'waitlist',
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: 'MentorsHub',
      context: {
        firstName: user.firstName,
      },
      recipients: [user.email],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }
}
