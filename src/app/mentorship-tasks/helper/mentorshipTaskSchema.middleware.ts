import { updateGoalDueDate } from '@app/app/mentorship-goals/helpers/updateGoalDueDate.helper';
import { MentorshipGoalsService } from '@app/app/mentorship-goals/mentorship-goals.service';
import { Model } from 'mongoose';
import { TaskSchema, TaskDocument } from '../mentorship-tasks.schema';

export async function mentorshipTaskSchemaMiddleware(
  mentorshipGoalService: MentorshipGoalsService
) {
  // This middleware will automatically update the duedate on the corresponding Goal of this Task
  // this action will be trigger on save i.e while creating a task and
  // on findOneAndUpdate

  const taskSchema = TaskSchema;

  taskSchema.post('save', async function (doc, next) {
    updateGoalDueDate({
      mentorshipGoalService,
      doc,
      next,
      hook: 'save',
      currentDuration: doc.duration,
    });
  });

  taskSchema.pre('findOneAndUpdate', async function (next) {
    const mentorshipTaskModel = this.model as Model<TaskDocument>;
    const filter = this.getFilter();

    // getting the previous duration on the task before updating it
    // and pass it to the post middleware
    this['previousData'] = (await mentorshipTaskModel.findOne(filter)).duration;

    next();
  });

  taskSchema.post('findOneAndUpdate', async function (doc, next) {
    const previousDuration = this['previousData'];
    const currentDuration = doc.duration;

    const update = this.getUpdate();
    if (update['$set']?.duration && previousDuration !== currentDuration) {
      updateGoalDueDate({
        mentorshipGoalService,
        doc,
        next,
        previousDuration,
        currentDuration,
        hook: 'findOneAndUpdate',
      });
    }
  });

  return taskSchema;
}
