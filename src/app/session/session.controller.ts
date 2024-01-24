import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSsessionDto } from './dto/update-session.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Mentorship Session')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiHeader({
  name: 'Authorization',
  description: 'Bearer <token>',
  required: true,
})
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a mentorship session' })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Mentorship session created successfully',
  })
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.createSession(createSessionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mentorship session by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the mentorship session to update',
  })
  @ApiBody({ type: UpdateSsessionDto })
  @ApiResponse({
    status: 200,
    description: 'Mentorship session updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Mentorship session not found' })
  updateSession(
    @Body() updateSessionDto: UpdateSsessionDto,
    @Param('id') id: string
  ) {
    return this.sessionService.updateMentorshipSession(updateSessionDto, id);
  }
}
