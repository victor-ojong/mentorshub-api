import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GuardType } from './type';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndMerge(GuardType.ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const accountType = request.user.accountType;

    if (!roles.some((role) => role === accountType)) {
      throw new UnauthorizedException(
        'You do not have the required role to perform this operation'
      );
    } else {
      return true;
    }
  }
}
