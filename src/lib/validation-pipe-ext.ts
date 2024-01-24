import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipeExt extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(
        `Validation failed: ${this.formatErrors(errors)}`
      );
    }

    return value;
  }

  toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): string {
    return errors
      .map((error) => Object.values(error.constraints).join(', '))
      .join('; ');
  }
}
