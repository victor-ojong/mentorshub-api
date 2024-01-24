import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Patch,
  Param,
  Req,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiHeader,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('auth/register')
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Signup user' })
  @ApiOkResponse({ description: 'User successfully created' })
  register(@Body() registerDto: RegisterDto) {
    return this.authenticationService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User successfully logged in' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  @ApiOperation({ summary: 'Log in user' })
  login(@Request() req: any) {
    return this.authenticationService.login(req.user);
  }

  @Get('auth/accountType/:accountType')
  @ApiOperation({
    summary:
      'Sets accountType for the user before requesing for 3rd party authentication using cookies',
  })
  @ApiParam({
    name: 'accountType',
    description: 'Account Type of user" mentor" or "mentee" ',
  })
  async saveToCookie(
    @Param('accountType') accountType: string,
    @Res() res: Response
  ) {
    res.cookie('accountType', accountType);
    res.send({ success: true });
  }

  @Get('auth/github')
  @ApiOperation({ summary: 'Verifying and logging in users using github' })
  @ApiOkResponse({ description: 'User successfully logged in using github' })
  @ApiBadRequestResponse({
    description: 'Error verifying users github token',
  })
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Initiates the github OAuth process
  }

  @Get('auth/github/callback')
  @ApiOperation({
    summary: 'Github redirect url',
  })
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@Req() req) {
    return this.authenticationService.githubSignup(req);
  }

  @Get('auth/google')
  @ApiOperation({ summary: 'Verifying and logging in users using google' })
  @ApiOkResponse({ description: 'User successfully logged in using google' })
  @ApiBadRequestResponse({
    description: 'Error verifying users google token',
  })
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates the google OAuth process
  }

  @Get('auth/google/callback')
  @ApiOperation({
    summary: 'Google redirect url',
  })
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req) {
    return this.authenticationService.googleSignup(req);
  }

  @Get('auth/linkedin')
  @ApiOperation({ summary: 'Verifying and logging in users using linkedin' })
  @ApiOkResponse({ description: 'User successfully logged in using linkedin' })
  @ApiBadRequestResponse({
    description: 'Error verifying users linkedin token',
  })
  @UseGuards(AuthGuard('linkedin'))
  async linkedinLogin() {
    // Initiates the github OAuth process
  }

  @Get('auth/linkedin/callback')
  @ApiOperation({
    summary: 'LinkedIn redirect url',
  })
  async linkedinLoginCallback(@Query('code') code, @Req() req) {
    return this.authenticationService.getLinkedinAccessToken(code, req);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('auth/resend-email-verification')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Re-send email verification email' })
  @ApiOkResponse({ description: 'Email Verification sent successfully' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <token>',
    required: true,
  })
  resendEmailVerification(@Request() req: any) {
    return this.authenticationService.resendEmailVerification(req.user);
  }

  @Patch('auth/verifications/:reference')
  @ApiBody({ type: String, description: 'Token for account verification' })
  @ApiOperation({ summary: 'Verifying authentication token and reference' })
  @ApiParam({
    name: 'reference',
    type: 'string',
    required: true,
    description: 'Unique reference for account verification',
  })
  @ApiOkResponse({ description: 'Account successfully verified' })
  @ApiBadRequestResponse({ description: 'Invalid token or reference' })
  verifyAccount(
    @Body() payload: { token: string },
    @Param('reference') reference: string
  ) {
    if (!payload?.token) {
      throw new HttpException('Token is required', HttpStatus.NOT_ACCEPTABLE);
    }
    if (!reference) {
      throw new HttpException(
        'Reference is required',
        HttpStatus.NOT_ACCEPTABLE
      );
    }
    return this.authenticationService.verifyAccount(reference, payload.token);
  }

  @Post('auth/password-reset')
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiBody({ type: String, description: 'Token for account verification' })
  @ApiOkResponse({ description: 'password reset successfull' })
  initiatePasswordReset(@Body() payload: { email: string }) {
    if (!payload?.email) {
      throw new HttpException('email is required', HttpStatus.NOT_ACCEPTABLE);
    }
    return this.authenticationService.initiatePasswordReset(payload.email);
  }

  @Patch('auth/password-reset/:reference')
  @ApiOkResponse({ description: 'Password reset successful' })
  @ApiOperation({ summary: 'Reset password' })
  @ApiBadRequestResponse({ description: 'Invalid token or missing password' })
  @ApiBody({
    type: Object,
    description: 'Payload for password reset',
    required: true,
    schema: {
      properties: {
        password: {
          type: 'string',
          minLength: 6,
          description: 'New password for the user account',
        },
        token: {
          type: 'string',
          description: 'Token for password reset',
        },
      },
    },
  })
  @ApiParam({
    name: 'reference',
    type: 'string',
    required: true,
    description: 'Unique reference for password reset',
  })
  resetPassword(
    @Body() payload: { password: string; token: string },
    @Param('reference') reference: string
  ) {
    if (!payload?.password) {
      throw new HttpException(
        'Password is required',
        HttpStatus.NOT_ACCEPTABLE
      );
    }
    if (!payload.token) {
      throw new HttpException('Token is required', HttpStatus.NOT_ACCEPTABLE);
    }
    return this.authenticationService.resetPassword(
      reference,
      payload.token,
      payload.password
    );
  }
}
