import { User } from '@app/app/user/user.schema';
import mongoose from 'mongoose';

export type UserWithId = User & {
  _id: mongoose.Types.ObjectId;
};
