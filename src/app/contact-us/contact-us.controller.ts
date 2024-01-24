import { Body, Controller, Post } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsDto } from './dto/contact-us.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Contact-Us')
@Controller()
export class ContactUsController {
  constructor(private ContactUsService: ContactUsService) {}

  @Post('contact-us')
  @ApiOperation({ summary: 'Submit a contact us form' })
  @ApiCreatedResponse({ description: 'Contact form submitted successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or missing data' })
  @ApiBody({ type: ContactUsDto, description: 'Data for contact us form' })
  ContactUs(@Body() ContactUsDto: ContactUsDto) {
    return this.ContactUsService.ContactUs(ContactUsDto);
  }
}
