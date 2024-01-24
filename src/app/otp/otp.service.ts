import { config } from '@app/config';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as moment from 'moment';

import {
  cipher,
  generateVerificationString,
  hashUtils,
} from '../../lib/utils.lib';
import { VerificationService } from '../authentication/verification.service';

@Injectable()
export class OtpService {
  tokenTTLSevenDays = 60 * 60 * 24 * 7;
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @Inject('token-generator') private generateToken: (sub: number) => string
  ) {}

  generateOtpToken(subject: string) {
    this.logger.log(`generating otp for subject with id ${subject}`);
    const token = this.generateToken(config.tokenLength);
    const plainText = generateVerificationString(subject, token, Date.now());
    const hash = hashUtils.shortSignature(plainText);
    const cipherTextWithSignature = this.encrypt(
      `${plainText}.signature:${hash}`
    );
    const reference = cipherTextWithSignature;
    return { reference, token, tokenTTLSeconds: this.tokenTTLSevenDays };
  }

  verifyToken(ref: string, token?: string): void | VerifiableObject {
    const cipherText = ref;
    const verifiableObject = this.resolveVerifiableObject(cipherText);
    this.validateVerifiableObject(verifiableObject);
    if (!token && verifiableObject) {
      return verifiableObject;
    } else {
      if (token === verifiableObject.token) {
        return verifiableObject;
      }
      throw new BadRequestException({
        message: 'token is invalid',
        field: 'token',
      });
    }
  }

  private validateVerifiableObject(verifiableObject: VerifiableObject) {
    const iat = verifiableObject.iat
      ? parseInt(verifiableObject.iat)
      : verifiableObject.iat;
    const text = generateVerificationString(
      verifiableObject.id,
      verifiableObject.token,
      iat as number
    );
    const hash = String(hashUtils.shortSignature(text));
    if (hash !== verifiableObject.signature) {
      throw new HttpException(
        'invalid verification token',
        HttpStatus.BAD_REQUEST
      );
    }
    const issuedAt = moment(iat);
    if (issuedAt.add(this.tokenTTLSevenDays, 'seconds') < moment()) {
      throw new HttpException('token has expired', HttpStatus.BAD_REQUEST);
    }
  }

  private resolveVerifiableObject(cipherText: string): VerifiableObject {
    const plainTextWithSignature = this.decrypt(cipherText);

    if (plainTextWithSignature) {
      const parts: string[] = plainTextWithSignature.split(/\./g);
      const obj = {};
      if (parts?.length) {
        for (const part of parts) {
          const [key, value] = part.split(':');
          obj[key] = value;
        }
      }
      return obj as any;
    }
  }

  private encrypt(text: string) {
    return cipher().encrypt(text);
  }

  private decrypt(cipherText: string) {
    return cipher().decrypt(cipherText);
  }
}

type VerifiableObject = {
  id: string;
  token: string;
  iat: string;
  signature: string;
};
