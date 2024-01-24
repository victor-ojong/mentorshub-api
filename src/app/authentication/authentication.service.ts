import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bull';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import * as moment from 'moment';

import { queues } from '../../queue/config.queue';
import { hashUtils, printObject } from '../../lib/utils.lib';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { EmailJob } from '../../queue/jobs/email.job';
import { JwtPayload } from './authentication.constant';
import { VerificationService } from './verification.service';
import { OtpService } from '../otp/otp.service';
import { Gender, User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  constructor(
    @InjectQueue(queues.notification.name) private notificationQueue: Queue,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private userService: UserService,
    private jwtService: JwtService,
    private accountVerificationService: VerificationService,
    private otpService: OtpService
  ) {}

  async getLinkedinAccessToken(
    authorizationCode: string,
    req
  ): Promise<string> {
    try {
      const response = await fetch(
        'https://www.linkedin.com/oauth/v2/accessToken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_SECRET,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `LinkedIn API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      const accessToken = data.access_token;

      return this.getLinkedinUserCredentials(accessToken, req);
    } catch (error) {
      throw error;
    }
  }

  async getLinkedinUserCredentials(
    accessToken: string,
    req: any
  ): Promise<any> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(
          `LinkedIn API request failed with status ${response.status}`
        );
      }

      const profile = await response.json();
      const firstName = profile.given_name;

      const lastName = profile.family_name ?? firstName
      const email = profile.email;
      if (!email) {
        return {
          success: false,
          message:
            'Your Email is set to Private on your linkedIn account kindly make it public and try again',
        };
      }

      const accountType = req.cookies['accountType'] ?? 'mentee';

      const user = {
        firstName,
        lastName,
        email,
        password: profile.email,
        accountType,
        gender: Gender.other,
      };
      return this.socialsSignup(user);
    } catch (error) {
      throw error;
    }
  }

  googleSignup(req) {
    return this.getSocialAuthData(req);
  }

  githubSignup(req) {
    return this.getSocialAuthData(req);
  }

  async socialsSignup(socialsSignupDto) {
    const user = await this.userService.findOne({
      email: socialsSignupDto.email,
    });

    if (user) {
      const payload: JwtPayload = { email: user.email, sub: user.id };
      return {
        accessToken: this.jwtService.sign(payload),
        user,
      };
    } else {
      return this.register(socialsSignupDto);
    }
  }

  private getSocialAuthData(req) {
    if (!req.user) {
      return {
        success: false,
        message: 'Authentication failed',
      };
    }

    const { email, firstName, lastName } = req.user;
    const password = req.user.email;
    const accountType = req.cookies['accountType'] ?? 'mentee';
    return this.socialsSignup({
      email,
      firstName,
      lastName,
      password,
      accountType,
    });
  }
  async register(registerDto: RegisterDto) {
    this.logger.log(`Registering user`);
    await this.userService.findOne({
      email: registerDto.email,
    });

    const createdUser = await this.userService.create({
      ...registerDto,
    });
    const verification = this.initiateEmailVerification(createdUser);
    const accessToken = this.jwtService.sign({
      email: createdUser.email,
      sub: createdUser.id,
    });
    this.sendWelcomeEmail(createdUser, verification);
    return {
      accessToken,
      ...omit(verification, ['token']),
      ...omit(createdUser, ['password']),
      ...createdUser,
    };
  }

  async resendEmailVerification(currentUser: any) {
    this.logger.log(`Resending email verification to user`);
    const verifyYourEmail = this.initiateEmailVerification(currentUser);
    this.resendEmailVerify(currentUser, verifyYourEmail);
  }

  initiateEmailVerification(user: User) {
    try {
      return this.accountVerificationService.initiateEmailVerification(user);
    } catch (error) {
      this.logger.error(
        'initiateEmailVerification - error initiating email verification',
        error
      );
      throw error;
    }
  }

  async initiatePasswordReset(email: string) {
    const user = await this.userService.findOne({ email });
    if (!user) {
      throw new NotFoundException(
        'an account with the email you provided was not found'
      );
    }
    const { reference, token, tokenTTLSeconds } =
      this.otpService.generateOtpToken(user.id);
    this.sendPasswordResetNotification(user, reference, token);
    return { reference, ttlSeconds: tokenTTLSeconds };
  }

  async resetPassword(ref: string, token: string, newPassword: string) {
    try {
      this.logger.log(`Reset password - ref ${ref} - token ${token}`);
      const verifiableObject = this.otpService.verifyToken(ref, token);
      this.logger.log(`got verifiable object - ${verifiableObject}`);
      if (verifiableObject) {
        const userId = verifiableObject.id;

        await this.userModel.findByIdAndUpdate(
          userId,
          {
            password: hashUtils.hash(newPassword),
          },
          {
            new: true,
          }
        );
        return { success: true, message: 'Password reset successful' };
      }
    } catch (error) {
      this.logger.error('resetPassword - error resetting account', error);
      throw error;
    }
  }

  sendPasswordResetNotification(user: User, reference: string, token: string) {
    this.logger.log(
      `sending password reset token - user ${printObject(
        user
      )} - reference ${reference} - token ${token}`
    );
    const emailJob = new EmailJob({
      subject: 'Password Reset',
      body: {
        templateName: 'otp',
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: 'MentorsHub',
      context: {
        token,
        reference_link: `https://mentorshub.io/reset-password?ref=${reference}token=${token}`,
        email: user.email,
      },
      recipients: [user.email],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }

  async verifyAccount(ref: string, token?: string) {
    try {
      this.logger.log(`Verifying account - ref ${ref} - token ${token}`);
      const verifiableObject = this.accountVerificationService.verifyAccount(
        ref,
        token
      );
      this.logger.log(`got verifiable object - ${verifiableObject}`);
      if (verifiableObject) {
        const userId = verifiableObject.id;
        await this.userService.updateProfile(userId, {
          emailVerifiedAt: moment().toDate(),
        } as User);
        return { success: true, message: 'verification successful' };
      }
    } catch (error) {
      this.logger.error('verifyAccount - error verifying account', error);
      throw error;
    }
  }

  login(user: Partial<UserDocument>) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async validateUser(emailOrPhone: string, password: string) {
    return await this.userService.validateUser(emailOrPhone, password);
  }

  protected sendWelcomeEmail(
    user: User,
    verification: { reference: any; ttlSeconds: number; token: any }
  ) {
    const emailJob = new EmailJob({
      subject: 'Welcome',
      body: {
        templateName: 'welcome',
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: 'MentorsHub',
      context: {
        firstName: user.firstName,
        email_verification_url: `https://mentorshub.io/email-verification?ref=${verification.reference}&token=${verification.token}`,
      },
      recipients: [user.email],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }

  protected resendEmailVerify(
    user: User,
    verifyYourEmail: { reference: any; ttlSeconds: number; token: any }
  ) {
    const emailJob = new EmailJob({
      subject: 'Resending Email Verification',
      body: {
        templateName: 'resend-email-verification',
      },
      senderEmail: 'hello@mentorshub.io',
      senderName: 'MentorsHub',
      context: {
        firstName: user.firstName,
        email_verification_url: `https://mentorshub.io/email-verification?ref=${verifyYourEmail.reference}&token=${verifyYourEmail.token}`,
      },
      recipients: [user.email],
    });
    this.notificationQueue.add(emailJob.JobName, emailJob.params);
  }
}
