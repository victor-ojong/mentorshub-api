import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { InterestService } from './interest.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { FindInterestDto } from './dto/find-interest.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Interests')
@Controller('interests')
export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interest' })
  @ApiCreatedResponse({ description: 'Interest created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiBody({
    type: CreateInterestDto,
    description: 'Data for creating a new interest',
  })
  create(@Body() createInterestDto: CreateInterestDto) {
    return this.interestService.create(createInterestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all interests' })
  @ApiOkResponse({ description: 'Interests found successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiQuery({
    description: 'Search or sort results',
    type: FindInterestDto,
  })
  findAll(@Query() findInteresDto: FindInterestDto) {
    return this.interestService.findAll(findInteresDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find an interest by ID' })
  @ApiOkResponse({ description: 'Interest found successfully' })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  @ApiParam({
    name: 'id',
    description: 'ID of the interest',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @Get(':id')
  @ApiOperation({ summary: 'Find an interest by ID' })
  @ApiOkResponse({ description: 'Interest found successfully' })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  @ApiParam({
    name: 'id',
    description: 'ID of the interest to retrieve',
    type: String,
    example: '123',
  })
  findOne(@Param('id') id: string) {
    const interest = this.interestService.findOne(id);

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    return interest;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interest by ID' })
  @ApiOkResponse({ description: 'Interest updated successfully' })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiParam({
    name: 'id',
    description: 'ID of the User',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateInterestDto,
    description: 'Data for updating an interest',
  })
  update(
    @Param('id') id: string,
    @Body() updateInterestDto: UpdateInterestDto
  ) {
    return this.interestService.update(id, updateInterestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interest by ID' })
  @ApiOkResponse({ description: 'Interest deleted successfully' })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  @ApiParam({
    name: 'id',
    description: 'ID of the interest to delete',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  remove(@Param('id') id: string) {
    return this.interestService.remove(id);
  }
}
