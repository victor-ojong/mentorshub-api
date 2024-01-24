import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';

import {
  hashUtils,
  printObject,
  stripOffNonEntityProps,
} from '../../lib/utils.lib';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.schema';
import { UploadService } from '../upload/upload.service';
import { projectctions } from '@app/lib/buildFilterQuery';
import { FindUserDto } from './dto/find-user.dto';
import { Model } from 'mongoose';
@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private uploadService: UploadService
  ) {}

  async create(createUserDto: CreateUserDto, profileImg?: Express.Multer.File) {
    this.logger.log(`Creating new user - ${printObject(createUserDto)}`);
    if (createUserDto.password) {
      createUserDto.password = hashUtils.hash(createUserDto.password);
    }
    if (profileImg) {
      createUserDto.profilePicture =
        (await this.uploadService.uploadFile(profileImg)).secure_url ?? '';
    }
    try {
      return (
        await this.userModel.create({
          ...createUserDto,
          isEmailVerified: true,
          isPhoneVerified: true,
        })
      )?.toJSON?.();
    } catch (error) {
      if ((error as any).code === 11000) {
        this.logger.error('Email is already in use.', { error });
        throw new BadRequestException({
          message: 'Email is already in use.',
          field: 'email',
        });
      } else {
        throw error;
      }
    }
  }

  async findOne(filter: Partial<User> | Partial<UserDocument>) {
    this.logger.log(`Fetching user using filter - ${printObject(filter)}`);
    try {
      stripOffNonEntityProps(filter);
      const user = await this.userModel.findOne(filter as User);
      return user?.toJSON?.();
    } catch (error) {
      this.logger.error(`Error fetching user - error - ${printObject(error)}`);
      throw error;
    }
  }

  async findAllMentors(filter: FindUserDto) {
    this.logger.log(`Fetching all mentors`);
    const pipeline = projectctions(filter);

    const mentors = await this.userModel.aggregate([
      ...pipeline,
      ...this.getAvailabilityAndPlansStages(),
    ]);
    return mentors.map((mentor) => mentor); // @Pius, why are we mapping over mentors here, shouldn't we just return mentors?
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
    profileImg?: Express.Multer.File
  ) {
    this.logger.log(
      `Updating user with id ${userId} - updates ${printObject(updateUserDto)}`
    );

    if (profileImg && profileImg.buffer) {
      updateUserDto.profilePicture =
        (await this.uploadService.uploadFile(profileImg)).secure_url ?? '';
    }

    if (updateUserDto.password) {
      const user = await this.userModel.findById(userId);
      if (!(user.password === hashUtils.hash(updateUserDto.currentPassword))) {
        throw new HttpException(
          'Incorrect current Password',
          HttpStatus.FORBIDDEN
        );
      }
      updateUserDto.password = hashUtils.hash(updateUserDto.password);
      updateUserDto.currentPassword = null;
    }

    const updateQuery: any = {};
    for (const [key, value] of Object.entries(updateUserDto)) {
      updateQuery[key] = value;
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        updateQuery,
        {
          new: true,
        }
      );
      return updatedUser?.toJSON?.();
    } catch (error) {
      this.logger.log(error);
    }
  }

  async findOneByIdAndUpdate(
    id: string,
    update: Partial<User> | Partial<UserDocument>
  ) {
    this.logger.log(
      `Updating user with filter ${printObject(id)} - updates ${printObject(
        update
      )}`
    );
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, update, {
        new: true,
      });
      return updatedUser?.toJSON?.();
    } catch (error) {
      this.logger.log(error);
    }
  }

  async findById(id: string) {
    this.logger.log(`Fetching user using Id - ${printObject(id)}`);
    try {
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      this.logger.error(`Error fetching user - error - ${printObject(error)}`);
      throw error;
    }
  }

  async findMentorById(mentorId: string) {
    this.logger.log(`Fetching mentor using Id - ${mentorId}`);
    const pipeline = projectctions({ mentorId });
    const user = await this.userModel.aggregate([
      ...pipeline,
      ...this.getAvailabilityAndPlansStages(),
    ]);
    return user[0];
  }

  async validateUser(emailOrPhone: string, password: string) {
    const user: UserDocument = await this.userModel.findOne({
      email: emailOrPhone,
    });
    if (!user) {
      const subject = isEmail(emailOrPhone) ? 'email' : 'username';
      throw new UnauthorizedException(`${subject} is incorrect`);
    }
    if (user && user.password === hashUtils.hash(password)) {
      return user.toJSON();
    }
    throw new UnauthorizedException('incorrect password');
  }

  private getAvailabilityAndPlansStages() {
    return [
      {
        $lookup: {
          from: 'availabilities',
          localField: '_id',
          foreignField: 'mentorId',
          as: 'availability',
        },
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: 'mentor',
          as: 'plan',
        },
      },
      {
        $addFields: {
          availability: { $arrayElemAt: ['$availability', 0] },
          // Add other fields you want to include
        },
      },
    ];
  }
}
