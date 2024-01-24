import { config } from '@app/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserService } from '../../user/user.service';
import { JwtPayload } from '../authentication.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne({
      email: payload.email,
      _id: payload.sub as any,
    });
    if (!user) {
      throw new ForbiddenException('Invalid access token');
    }
    return user;
  }
}
