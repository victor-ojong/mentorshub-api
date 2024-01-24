import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  Mentorship,
  MentorshipDocument,
} from '../mentorship/mentorship.schema';
import { User, UserDocument } from '../user/user.schema';
import {
  MentorshipGroup,
  MentorshipGroupDocument,
} from './mentorship-group.schema';

@Injectable()
export class MentorshipGroupService {
  looger = new Logger(MentorshipGroupService.name);

  constructor(
    @InjectModel(MentorshipGroup.name)
    private mentorshipGroupModel: Model<MentorshipGroupDocument>
  ) {}

  async addToGroup(
    mentor: User | UserDocument,
    mentee: User | UserDocument,
    mentorship: Mentorship | MentorshipDocument
  ) {
    this.looger.log('adding mentee to mentorship group');
    return await this.mentorshipGroupModel.create({
      mentee: (mentee as UserDocument).id,
      mentor: (mentor as UserDocument).id,
      mentorship: (mentorship as MentorshipDocument).id,
    });
  }

  async delete(id: string | mongoose.Schema.Types.ObjectId) {
    this.looger.log('deleting mentorship group');
    return await this.mentorshipGroupModel.findByIdAndDelete(id);
  }
}
