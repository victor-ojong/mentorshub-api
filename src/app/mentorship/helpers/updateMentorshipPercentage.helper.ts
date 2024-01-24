import { Model } from 'mongoose';
import { MentorshipService } from '../mentorship.service';
import { GoalStatus } from '@app/common/enum/GoalStatus';
import { MentorshipGoalDocument } from '@app/app/mentorship-goals/mentorship-goals.schema';

export async function updateMentorshipPercentage(
  mentorshipGoalModel: Model<MentorshipGoalDocument>,
  mentorshipService: MentorshipService,
  doc,
  next
) {
  const totalGoals = await mentorshipGoalModel.countDocuments({
    mentorshipId: doc.mentorshipId,
  });

  const totalCompletedGoals = await mentorshipGoalModel.countDocuments({
    mentorshipId: doc.mentorshipId,
    status: GoalStatus.COMPLETED,
  });

  const mentorshopProgressPercent = (
    (totalCompletedGoals / totalGoals) *
    100
  ).toFixed(1);

  await mentorshipService.updateProgressPercent(
    doc.mentorshipId.toString(),
    +mentorshopProgressPercent
  );

  next();
}
