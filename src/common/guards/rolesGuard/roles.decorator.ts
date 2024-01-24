import { SetMetadata } from '@nestjs/common';
import { GuardType } from './type';

export const Roles = (...roles: string[]) =>
  SetMetadata(GuardType.ROLES, roles);
