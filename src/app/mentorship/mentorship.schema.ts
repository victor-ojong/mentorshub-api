import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { MenteeProficiency } from '@app/common/enum/MenteeProficiency';
import { MentorshipProgressStatus } from '@app/common/enum/MentorshipProgressStatus';
import { MentorshipType } from '@app/common/enum/MentorshipType';

export type MentorshipDocument = HydratedDocument<Mentorship>;

@Schema({ timestamps: true })
export class Mentorship {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentor: string | mongoose.Types.ObjectId | User | UserDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  mentee: string | mongoose.Types.ObjectId | User | UserDocument;

  // this will keep track of the sessions for this mentorship(PERSONAL)
  // Sessions for group will be tracked in the group mentorship schema
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorshipSession',
  })
  mentorshipSessions: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    enum: MenteeProficiency,
  })
  proficiencyLevel: MenteeProficiency;

  @Prop({
    required: true,
    type: String,
  })
  growthAreas: string;

  /*
    this will change to ONGOING once the mentee confirms the mentorship either 
    by starting a session or any other criteria.
   */
  @Prop({
    default: MentorshipProgressStatus.INACTIVE,
    required: false,
    enum: MentorshipProgressStatus,
  })
  progressStatus: MentorshipProgressStatus;

  /*
   @param progressPercent is gotten from the percentage of completed goals / total goals.
    * Note: this is handled in the middleware of mentorshipGoalSchema which is 
    * found in mentorship goal module. 
   */
  @Prop({
    default: 0,
    required: false,
    type: Number,
  })
  progressPercent: number;

  // Direct subscription to a mentorship program will mark this as PERSONAL
  // In the future when mentorship Group is implemented, this will be marked
  // as GROUP if the mentee only subscribed to a Group mentorship rather than PERSONAL
  @Prop({
    default: MentorshipType.PERSONAL,
    required: false,
    enum: MentorshipType,
  })
  mentorshipType: MentorshipType;
}

export const MentorshipSchema = SchemaFactory.createForClass(Mentorship);
