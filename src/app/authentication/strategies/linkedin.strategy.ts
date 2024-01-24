import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      passReqToCallback: true,
      scope: ['openid', 'profile', 'email'],
    });
  }
}
