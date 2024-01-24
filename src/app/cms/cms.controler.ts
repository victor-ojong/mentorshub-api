import { Body, Controller, Get } from '@nestjs/common';
import { CMSService } from './cms.service';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { any } from 'ramda';
@ApiTags('cms')
@Controller('')
export class CMSController {
  constructor(private readonly CMSService: CMSService) {}

  @Get('cms')
  @ApiOperation({ summary: 'Display All search queries' })
  @ApiBody({
    description: 'Search for all mentors',
    type: String,
  })
  async getAllContent(@Body() query: any) {
    return await this.CMSService.findAll(query);
  }
}
