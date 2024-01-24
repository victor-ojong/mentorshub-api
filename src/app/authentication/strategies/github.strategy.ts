import { Gender } from '@app/app/user/user.schema';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['public_profile', 'user:email'],
    });
  }
  async validate(accessToken: string, _refreshToken: string, profile: Profile) {

    const email = profile.emails.at(0).value;
    const firstName = profile.displayName.split(' ').at(0);
    const lastName = profile.displayName.split(' ').at(0) ?? firstName

    if (!email) {
      return {
        success: false,
        message:
          'Your Email is set to Private on your github account kindly make it public and try again',
      };

      const password = email;
      const gender = Gender.other;
      const user = {
        email,
        firstName,
        lastName,
        password,
        gender,
      };
      
      return user;
    }
  }
}
