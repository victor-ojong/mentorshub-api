import { PaginatedResult, Pagination } from '@app/lib/pagination.lib';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { omit } from 'ramda';
import { CreateInterestDto } from './dto/create-interest.dto';
import { FindInterestDto } from './dto/find-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { Interest, InterestDocument } from './interest.schema';

@Injectable()
export class InterestService {
  private logger = new Logger(InterestService.name);

  constructor(
    @InjectModel(Interest.name)
    private interestModel: Model<InterestDocument>
  ) {}

  async create(createInterestDto: CreateInterestDto) {
    this.logger.log('creating interests', { createInterestDto });
    return await this.interestModel.create({
      name: createInterestDto.name,
      description: createInterestDto.description,
    });
  }

  async findAll(params: FindInterestDto) {
    this.logger.log('fetching interest - data -', { params });
    const options = params.options;
    const query = omit(['options'], params);
    const paginationOptions = new Pagination(options.page, options.perPage);
    const [result, total] = await Promise.all([
      this.interestModel
        .find(query)
        .sort(options.sort || { createdAt: 'descending' })
        .limit(paginationOptions.perPage)
        .skip(paginationOptions.skip),
      this.interestModel.count(query),
    ]);
    return PaginatedResult.create(result, total, paginationOptions);
  }

  async findOne(id: string) {
    this.logger.log('fetching one interest - data -', { id });
    return await this.interestModel.findById(id);
  }

  async update(id: string, updateInterestDto: UpdateInterestDto) {
    this.logger.log('updating one interest - data -', {
      id,
      updateInterestDto,
    });
    return await this.interestModel.findByIdAndUpdate(id, updateInterestDto);
  }

  async remove(id: string) {
    this.logger.log('deleting one interest - data -', {
      id,
    });
    return await this.interestModel.findByIdAndDelete(id);
  }
}
