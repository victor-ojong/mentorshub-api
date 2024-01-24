import { TaskDocument } from '@app/app/mentorship-tasks/mentorship-tasks.schema';
import { MentorshipGoalsService } from '../mentorship-goals.service';
import {
  IDuration,
  convertDurationToDays,
  getDueDatesFromDuration,
} from '@app/common/functions/getDueDateFromDuration';

interface Payload {
  previousDuration?: IDuration;
  currentDuration?: IDuration;
  mentorshipGoalService: MentorshipGoalsService;
  doc: TaskDocument;
  hook: 'save' | 'findOneAndUpdate' | 'findOneAndDelete';
  next: () => void;
}
export async function updateGoalDueDate({
  mentorshipGoalService,
  doc,
  hook,
  next,
  previousDuration,
  currentDuration,
}: Payload) {
  /* 
      @param daysLeft:  difference between the Gaol's due date and today's date in days
      @param currentDurationdays:  current duration in days after updating it
      @params previousDurationDays: previous duration of a task in days before updating it 
  */

  // We get the corresponding Goal of the Task.
  const mentorshipGoal = await mentorshipGoalService.findOne(
    doc.mentorshipGoalId.toString(),
    doc.mentor.toString()
  );

  // this function simply returns the difference between two due dates in milliseconds
  const dueDateDiff = (dueDate: Date) => {
    return new Date(dueDate).getTime() - new Date().getTime();
  };

  const currentDurationdays = currentDuration
    ? convertDurationToDays(currentDuration)
    : null;
  const previousDurationDays = previousDuration
    ? convertDurationToDays(previousDuration)
    : null;

  let dueDate: Date;

  // if dueDate is not null, undefined  and the dueDateDiff >  0, this means that
  // the goal has a dueDate and it has not expired or exceeded.
  if (mentorshipGoal.dueDate && dueDateDiff(mentorshipGoal.dueDate) > 0) {
    const daysLeft = Math.ceil(
      dueDateDiff(mentorshipGoal.dueDate) / (1000 * 60 * 60 * 24)
    );

    if (hook === 'save') {
      dueDate = getDueDatesFromDuration(`${daysLeft + currentDurationdays}d`);
    }

    if (hook === 'findOneAndUpdate') {
      const diffInDays = currentDurationdays - previousDurationDays;

      dueDate = getDueDatesFromDuration(`${daysLeft + diffInDays}d`);
    }

    if (hook === 'findOneAndDelete') {
      dueDate = getDueDatesFromDuration(`${daysLeft + previousDurationDays}d`);
    }
  } else {
    dueDate = getDueDatesFromDuration(`${currentDurationdays}d`);
  }

  await mentorshipGoalService.findOneAndUpdate(
    doc.mentorshipGoalId.toString(),
    {
      dueDate: dueDate,
    }
  );

  next();
}
