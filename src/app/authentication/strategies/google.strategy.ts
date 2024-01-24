import { Gender } from '@app/app/user/user.schema';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    VerifyCallback
  ): Promise<any> {
    try {
      const { displayName, emails } = profile;
      const firstName = displayName.split(' ')[0];
      const lastName = displayName.split(' ')[1] || firstName;
      const user = {
        firstName,
        lastName,
        email: emails[0].value,
        password: emails[0].value,
        gender: Gender.other,
      };
      return VerifyCallback(null, user);
    } catch (error) {
      return VerifyCallback(error, false);
    }
  }
}
