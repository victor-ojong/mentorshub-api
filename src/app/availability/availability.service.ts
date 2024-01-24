import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Availability, AvailabilityDocument } from './availability.schema';
import { FilterQuery, Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { CreateOrUpdateAvailability } from './dto/create-or-update-availability';
import { availabilityDateCheckerPath } from '@app/lib/availabiltyDateChecker';
import { UpdateAvailableDateDto } from './dto/updateAvailableDate';

export class AvailabilityService {
  private logger = new Logger(AvailabilityService.name);
  constructor(
    @InjectModel(Availability.name)
    private availabilityModel: Model<AvailabilityDocument>,
    private userModel: UserService
  ) {}

  async createOrUpdateAvailability(
    createOrUpdateAvailabilityDto: CreateOrUpdateAvailability & {
      mentorId: string;
    }
  ) {
    this.logger.log('Creating or updating availability');
    const { mentorId, availableDates } = createOrUpdateAvailabilityDto;
    const user = await this.userModel.findById(mentorId);
    if (!user.id) {
      throw new NotFoundException('User not found');
    }

    const availability = await this.availabilityModel.findOne({
      mentorId: mentorId.toString(),
    });

    if (availableDates) {
      const isValidDate = availabilityDateCheckerPath(availableDates);
      if (!isValidDate) {
        throw new BadRequestException('Invalid date format');
      }
    }
    if (availability) {
      return await this.updateMentorAvailability(createOrUpdateAvailabilityDto);
    } else {
      return await this.createMentorAvailability(createOrUpdateAvailabilityDto);
    }
  }

  private async createMentorAvailability(
    createOrUpdateAvailabilityDto: CreateOrUpdateAvailability & {
      mentorId: string;
    }
  ) {
    const { mentorId, availableDates, availableSlots } =
      createOrUpdateAvailabilityDto;
    try {
      const availability = await this.availabilityModel.create({
        mentorId: mentorId.toString(),
        availableDates,
        availableSlots,
      });
      return availability;
    } catch (error) {
      this.logger.log(error);
    }
  }

  private async updateMentorAvailability(
    createOrUpdateAvailabilityDto: CreateOrUpdateAvailability & {
      mentorId: string;
    }
  ) {
    const updateQuery: any = {};
    for (const [key, value] of Object.entries(createOrUpdateAvailabilityDto)) {
      if (Array.isArray(value) && key === 'availableDates') {
        if (!updateQuery.$addToSet) {
          updateQuery.$addToSet = {};
        }
        if (!updateQuery.$addToSet[key]) {
          updateQuery.$addToSet[key] = { $each: [] };
        }
        updateQuery.$addToSet[key].$each.push(...value);
      } else {
        updateQuery[key] = value;
      }
    }
    const { mentorId } = createOrUpdateAvailabilityDto;
    const availabilityDoc = await this.findOneByMentorId(mentorId);

    try {
      const updatedAvailability =
        await this.availabilityModel.findByIdAndUpdate(
          availabilityDoc._id.toString(),
          updateQuery,
          {
            new: true,
          }
        );
      return updatedAvailability;
    } catch (error) {
      this.logger.log(error);
    }
  }

  async updateAvailableDates(
    updateAvailableDateDto: UpdateAvailableDateDto,
    mentorId: string
  ) {
    if (updateAvailableDateDto.availableDates) {
      const isValidDate = availabilityDateCheckerPath(
        updateAvailableDateDto.availableDates
      );
      if (!isValidDate) {
        throw new BadRequestException('Invalid date format');
      }
    }

    return await this.availabilityModel.findOneAndUpdate(
      { mentorId },
      { availableDates: updateAvailableDateDto.availableDates },
      { new: true }
    );
  }

  async findOneByMentorId(mentorId: string) {
    const availability = await this.availabilityModel.findOne({
      mentorId,
    });

    if (!availability) {
      this.logger.log(
        `availability not found, please create availability, mentor: ${mentorId}`
      );
      throw new NotFoundException(
        'availability not found, please create availability'
      );
    }
    return availability;
  }

  async findOneAndUpdate(
    filter: FilterQuery<Availability>,
    update: Partial<Availability> | Partial<AvailabilityDocument>
  ) {
    this.logger.log(
      `Updating availability with filter ${filter} - updates ${update}`
    );

    const updatedAvailability = await this.availabilityModel.findOneAndUpdate(
      filter,
      update,
      {
        new: true,
      }
    );
    if (!updatedAvailability) {
      this.logger.log(
        `availability not found, please create availability, filter: ${filter}`
      );
      throw new NotFoundException(
        'availability not found, please create availability'
      );
    }

    return updatedAvailability;
  }
}
