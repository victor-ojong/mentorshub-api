import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AiMentorshipService } from './ai-mentorship.service';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateAiMentorshipDto } from './dto/create-ai-mentorship.dto';
import { CreateAiSessionDto } from './dto/create-ai-session.dto';
@UseGuards(JwtAuthGuard)
@Controller('ai-mentorship')
export class AiMentorshipController {
  constructor(private aiMentorshipService: AiMentorshipService) {}
  @Post()
  async startConversation(
    @Body() createAiMentorshipDto: CreateAiSessionDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    return await this.aiMentorshipService.startSession(
      createAiMentorshipDto,
      req.user._id
    );
  }

  @Post('/program')
  async createAiMentorshipProgram(
    @Body() createAiMentorshipDto: CreateAiMentorshipDto,
    @Request() req: ExpressRequest & { user: JwtPayload }
  ) {
    return await this.aiMentorshipService.createAiMentorshipProgram(
      createAiMentorshipDto,
      req.user._id
    );
  }

  @Get('/program')
  async findAiMentorshipProgram(
    @Body() createAiMentorshipDto: { menteeId: string; mentorId: string }
  ) {
    return await this.aiMentorshipService.findAiMentorshipProgram(
      createAiMentorshipDto.menteeId,
      createAiMentorshipDto.mentorId
    );
  }
}
