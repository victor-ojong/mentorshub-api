import {
  PhoneNumberFormat as PNF,
  PhoneNumberUtil,
} from 'google-libphonenumber';
import {
  isString,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import * as crypto from 'crypto';

import * as fpe from 'node-fpe';
import { config } from '@app/config';

const { SHA_512_HASH } = process.env;

const phoneUtil = PhoneNumberUtil.getInstance();

export function normalizePhoneNumber(phoneNumber: string, countryCode: string) {
  const number = phoneUtil.parseAndKeepRawInput(
    phoneNumber,
    countryCode || 'NG'
  );
  return phoneUtil.format(number, PNF.E164);
}

export function extractPhoneNumberInfo(phoneNumber: string) {
  if (phoneNumber) {
    const phoneNumberUtil = PhoneNumberUtil.getInstance();
    const parsedNumber = phoneNumberUtil.parse(phoneNumber, 'ZZ'); // 'ZZ' means unknown region

    const countryCode = phoneNumberUtil.getRegionCodeForNumber(parsedNumber);
    const nationalNumber = phoneNumberUtil.format(parsedNumber, PNF.NATIONAL);

    return {
      countryCode,
      nationalNumber,
    };
  }
  return {
    countryCode: '',
    nationalNumber: '',
  };
}

/* 
  sorting should take the pattern:
  https://example.com?sort=fieldName1:order,fieldName2:order

  e.g https://shuttlers.ng/products?sort=name:asc,createdAt:desc,category:asc
*/
export function buildEntitySortObjectFromQueryParam(sort: string) {
  const sortOrder: any = {};
  if (sort) {
    const sortFields = sort.split(/\s*,\s*/);
    sortFields.forEach((sortField) => {
      const [field, orderValue] = sortField
        .split(/\s*:\s*/)
        .map((str) => str.trim());
      sortOrder[field] = (orderValue || '').toLowerCase();
    });
  }
  return sortOrder;
}

export function printObject(obj: any) {
  return obj ? JSON.stringify(obj) : '';
}

export const hashUtils = {
  hash(plainText: string) {
    const hash = crypto.createHash('sha512');
    return hash.update(`${plainText}${SHA_512_HASH}`).digest('hex');
  },
  compare(hashed: string, hash: string) {
    return hashed === hash;
  },
  shortSignature(plainText: string) {
    return cyrb53(plainText);
  },
};

export function cyrb53(str: string, seed = 1) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch: number; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function isEmail(str: string) {
  if (str.includes('@')) {
    return true;
  }
  return false;
}

export function IsEmailOrHandle(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrHandle',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && validateEmailOrHandle(value);
        },
      },
    });
  };
}

function validateEmailOrHandle(str: string) {
  if (isEmail(str) || (isString(str) && str.length >= 3)) {
    return true;
  }
  return false;
}

export function generateToken() {
  const chars =
    'AaBbCc0DdEeFf1GgHhIi2JjKk3LlMm4NnOo5PpQq6RrSs7TtUu8VvWw9XxYyZz0123456789';
  let token = '';
  const charsetLength = chars.length;
  for (let i = 0; i < 4; i++) {
    const randomCharIdx = Math.round(Math.random() * (charsetLength - 1));
    token += chars[randomCharIdx];
  }
  return token;
}

const numericChars = '0123456789';
const lowercaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseAlphabets = lowercaseAlphabets.toUpperCase();
const specialChars = '.-:';
const chars = `${numericChars}${lowercaseAlphabets}${uppercaseAlphabets}${specialChars}`;
const encryptDecrpt = fpe({
  secret: config.cryptoKey,
  domain: chars.split(''),
});

export function cipher() {
  return {
    encrypt(plainText: string) {
      return encryptDecrpt.encrypt(plainText);
    },
    decrypt(cipherText: string) {
      return encryptDecrpt.decrypt(cipherText);
    },
  };
}

export function generateVerificationString(
  id: string,
  token: string,
  iat: number
) {
  return `id:${id}.token:${token}.iat:${iat}`;
}

export function stripOffNonEntityProps(params: any) {
  const fieldsToStripOff = ['page', 'perPage', 'sort'];
  if (params && typeof params === 'object') {
    for (const prop of fieldsToStripOff) {
      delete params[prop];
    }
  }
}

export function formatArrayWithSeparators<T>(array: T[]): string {
  let result = '';
  if (array.length === 1) {
    result = array[0].toString();
  } else if (array.length === 2) {
    result = array.join(' and ');
  } else {
    const lastElement = array.pop();
    result = `${array.join(', ')}, and ${lastElement}`;
  }
  return result;
}
