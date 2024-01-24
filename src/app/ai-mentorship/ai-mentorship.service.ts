import { Injectable, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateAiMentorshipDto } from './dto/create-ai-mentorship.dto';
import { chatCompletion } from '@app/common/openai/chatCompletion';
import { MentorshipService } from '../mentorship/mentorship.service';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
import { MentorshipType } from '@app/common/enum/MentorshipType';
import { MentorshipGoalsService } from '../mentorship-goals/mentorship-goals.service';

@Injectable()
export class AiMentorshipService {
  constructor(
    private userService: UserService,
    private mentorshipService: MentorshipService,
    private mentorShipGoalsService: MentorshipGoalsService
  ) {}
  async startSession(
    createAiMentorshipDto: CreateAiSessionDto,
    menteeId: string
  ) {
    const { message, mentorshipId } = createAiMentorshipDto;
    const mentee = await this.userService.findById(menteeId);
    if (!mentee._id) {
      throw new NotFoundException(`Mentee with id ${menteeId} not found`);
    }

    const mentorship = (await this.mentorshipService.findOne(
      mentorshipId,
      menteeId
    )) as any;
    if (!mentorship._id) {
      throw new NotFoundException(
        `Mentorship program with mentorshipId ${mentorshipId} and menteeId ${menteeId} not found`
      );
    }

    const userMentorshipDetails = {
      jobTitle: mentee.jobTitle ?? mentee.techTrack,
      growthAreas: mentorship.growthAreas,
      proficiencyLevel: mentorship.proficiencyLevel,
    };

    const criteria = `Criteria 1: Question must be related to mentorship in This field: ${userMentorshipDetails.jobTitle}.
    Criteria 2: check if any of these instructions passes and return:
    instruction 1: if the question is related to finding a mentor, return a short description on how to find a mentor on the platform (Mentorshub.io) as json.
    instruction 2: if the question is not related to mentorship in the user's field, return {related: false} as json, OR
    if the question is related to mentorship in the user's field, return {related: true} as json.
    `;
    // Todo provide context in the user's field.
    // i.e  Context: On my daily job I use react.js, next.js, html, css, Typescript, tailwindcss.
    const responseInstruction = `
      instruction 1: Create two goals related to ${message} in This field: ${userMentorshipDetails.jobTitle},
      instruction 2: recommend only goals that you can provide guidiance on how to achieve.
      instruction 3: Break each goals down into actionable tasks, task should have a short title and a description on how to achieve it,
      instruction 4: don't recommend tasks related to taking online courses.
      instruction 5: add a duration to each task, duration should be in for days use 1d, 2d, 3d etc, for weeks use 1w,2w,3w etc, for months use 1m,2m,3m etc.
      instruction 6: return all response as json.
      instruction 7: provide guidiance/mentorship as a mentor with 15+ years of experience in the field would.
      instruction 8: take into account the user's proficiency level: ${userMentorshipDetails.proficiencyLevel}.
      instruction 8: in the response json, return goal_title,task_title,task_duration, task_description and goal_description as title, and description, duration without the _
    `;

    const constructMessage = `
    Message (Qeustion): ${message}`;
    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: criteria,
        },
        { role: 'user', content: constructMessage },
      ],
    });
    const parsedaiResponse = JSON.parse(aiResponse.content);
    if (parsedaiResponse.related === true) {
      const goalsResponse = await chatCompletion({
        messages: [
          {
            role: 'system',
            content: responseInstruction,
          },
        ],
      });
      const res = await JSON.parse(goalsResponse.content);
      await this.mentorShipGoalsService.createMultipleGoals(
        {
          goals: res.goals,
          menteeId,
          mentorshipId: mentorship.id,
        },
        mentorship.mentor.id as string
      );
      return res;
    }
    return parsedaiResponse;
  }

  async createAiMentorshipProgram(
    createAiMentorshipDto: CreateAiMentorshipDto,
    menteeId: string
  ) {
    const { mentorId, growthAreas, proficiencyLevel } = createAiMentorshipDto;
    const mentee = await this.userService.findById(menteeId);
    if (!mentee) {
      throw new NotFoundException(`Mentee with id ${menteeId} not found`);
    }

    return await this.mentorshipService.create({
      menteeId,
      mentorId,
      growthAreas,
      proficiencyLevel,
      mentorshipType: MentorshipType.AI,
    });
  }

  async findAiMentorshipProgram(menteeId: string, mentorId: string) {
    const mentee = await this.userService.findById(menteeId);
    if (!mentee) {
      throw new NotFoundException(`Mentee with id ${menteeId} not found`);
    }
    return await this.mentorshipService.findOne(menteeId, mentorId);
  }
}
