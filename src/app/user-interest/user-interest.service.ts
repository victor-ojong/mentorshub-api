import { PaginatedResult, Pagination } from '@app/lib/pagination.lib';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { omit } from 'ramda';
import { JwtPayload } from '../authentication/authentication.constant';
import { CreateUserInterestDto } from './dto/create-user-interest.dto';
import { FindUserInterestDto } from './dto/find-user-interest.dto';
import { UserInterest, UserInterestDocument } from './user-interest.schema';

@Injectable()
export class UserInterestService {
  private logger = new Logger(UserInterestService.name);

  constructor(
    @InjectModel(UserInterest.name)
    private userInterestModel: Model<UserInterestDocument>
  ) {}

  async create(createInterestDto: CreateUserInterestDto, auth: JwtPayload) {
    this.logger.log('creating user interests', { createInterestDto });
    return await this.userInterestModel.create(
      createInterestDto.interestIds.map((interestId) => ({
        user: auth.sub,
        interest: interestId,
      }))
    );
  }

  async findAll(params: FindUserInterestDto) {
    this.logger.log('fetching interest - data -', { params });
    const options = params.options;
    const query = omit(['options'], params);
    const paginationOptions = new Pagination(options.page, options.perPage);
    const [result, total] = await Promise.all([
      this.userInterestModel
        .find(query)
        .sort(options.sort || { createdAt: 'descending' })
        .limit(paginationOptions.perPage)
        .skip(paginationOptions.skip),
      this.userInterestModel.count(query),
    ]);
    return PaginatedResult.create(result, total, paginationOptions);
  }

  async findOne(id: string) {
    this.logger.log('fetching one interest - data -', { id });
    return await this.userInterestModel.findById(id);
  }

  async remove(id: string) {
    this.logger.log('deleting one interest - data -', {
      id,
    });
    return await this.userInterestModel.findByIdAndDelete(id);
  }
}
