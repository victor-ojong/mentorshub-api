import { Body } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { WaitlistService } from './waitlist.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('')
@ApiTags('Waitlist')
export class WaitlistController {
  constructor(private waitlistService: WaitlistService) {}

  @Post('waitlist')
  @ApiOperation({ summary: 'Join users waitlist' })
  @ApiBody({ type: JoinWaitlistDto })
  @ApiResponse({ status: 201, description: 'Joined waitlist successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async joinWaitlist(@Body() joinWaitlistDto: JoinWaitlistDto) {
    return await this.waitlistService.joinWaitList(joinWaitlistDto);
  }
}
