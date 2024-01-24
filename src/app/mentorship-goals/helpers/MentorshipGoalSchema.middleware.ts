import { updateMentorshipPercentage } from '@app/app/mentorship/helpers/updateMentorshipPercentage.helper';
import { MentorshipService } from '@app/app/mentorship/mentorship.service';
import {
  MentorshipGoalDocument,
  MentorshipGoalSchema,
} from '../mentorship-goals.schema';
import { Model } from 'mongoose';

export function mentorshipGoalSchemaMiddleware(
  mentorshipService: MentorshipService
) {
  const schema = MentorshipGoalSchema;

  schema.post('save', async function (doc, next) {
    const mentorshipGoalModel = this
      .constructor as Model<MentorshipGoalDocument>;
    updateMentorshipPercentage(
      mentorshipGoalModel,
      mentorshipService,
      doc,
      next
    );
  });

  schema.post('findOneAndUpdate', async function (doc, next) {
    const mentorshipGoalModel = this.model as Model<MentorshipGoalDocument>;
    updateMentorshipPercentage(
      mentorshipGoalModel,
      mentorshipService,
      doc,
      next
    );
  });

  schema.post('findOneAndDelete', async function (doc, next) {
    const mentorshipGoalModel = this.model as Model<MentorshipGoalDocument>;
    updateMentorshipPercentage(
      mentorshipGoalModel,
      mentorshipService,
      doc,
      next
    );
  });

  return schema;
}
