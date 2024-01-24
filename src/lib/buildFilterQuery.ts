import { FindUserDto } from '@app/app/user/dto/find-user.dto';
import {} from '@app/app/user/user.schema';
import mongoose from 'mongoose';

export const projectctions = (filter: FindUserDto & { mentorId?: string }) => {
  const pipeline = [];

  if (filter?.jobTitle) {
    pipeline.push({
      $match: {
        jobTitle: {
          $regex: new RegExp(filter.jobTitle.replace(/^"(.*)"$/, '$1'), 'i'),
        },
      },
    });
  }

  if (filter?.industry) {
    pipeline.push({
      $match: {
        industry: {
          $regex: new RegExp(filter.industry.replace(/^"(.*)"$/, '$1'), 'i'),
        },
      },
    });
  }

  if (filter?.stack) {
    const converToString = JSON.parse(filter.stack.toString());
    pipeline.push({
      $match: {
        stack: {
          $elemMatch: {
            $regex: new RegExp(converToString, 'i'),
          },
        },
      },
    });
  }

  if (filter?.yearsOfExperience) {
    pipeline.push({
      $match: {
        yearsOfExperience: filter.yearsOfExperience.replace(/^"(.*)"$/, '$1'),
      },
    });
  }

  if (filter?.search) {
    const searchRegex = new RegExp(
      filter.search.replace(/^"(.*)"$/, '$1'),
      'i'
    );
    pipeline.push({
      $match: {
        $or: [
          { jobTitle: { $regex: searchRegex } },
          { industry: { $regex: searchRegex } },
          { stack: { $elemMatch: { $regex: searchRegex } } },
          { firstName: { $regex: searchRegex } },
        ],
      },
    });
  }

  if (filter?.mentorId) {
    pipeline.push({
      $match: {
        _id: new mongoose.Types.ObjectId(filter.mentorId),
      },
    });
  }
  if (filter) {
    pipeline.push({ $match: { accountType: 'mentor' } });
  }

  pipeline.push({
    $project: {
      password: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
      interestedTools: 0,
      accountType: 0,
    },
  });
  return pipeline;
};
