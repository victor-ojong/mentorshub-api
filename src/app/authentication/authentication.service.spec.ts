import { getQueueToken } from '@nestjs/bull-shared';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { queues } from '../../queue/config.queue';
import { UserService } from '../user/user.service';
import { AuthenticationService } from './authentication.service';
import { VerificationService } from './verification.service';
import { OtpService } from '../otp/otp.service';
import { Gender } from '../user/user.schema';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const userServiceSpy = {
    findOne: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const queueSpy = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: userServiceSpy },
        {
          provide: getQueueToken(queues.notification.name),
          useValue: queueSpy,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockImplementation(JSON.stringify) },
        },
        {
          provide: VerificationService,
          useValue: {
            initiateEmailVerification: jest.fn(),
          },
        },
        { provide: OtpService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Registeration', () => {
    it('should succeed if user does not exist (findUnique returns null)', async () => {
      const newUser: any = {
        firstName: 'prince',
        lastName: 'ita',
        email: 'princeita@example.com',
        password: 'giberish',
        gender: Gender.male,
        accountType: 'mentee',
      };
      userServiceSpy.findOne.mockReturnValue(null);
      userServiceSpy.create.mockReturnValue(newUser);
      await service.register(newUser);
      expect(userServiceSpy.findUnique).toHaveBeenCalled();
      expect(userServiceSpy.create).toHaveBeenCalled();
      userServiceSpy.findUnique.mockRestore();
      userServiceSpy.create.mockRestore();
      queueSpy.add.mockRestore();
    });

    it('should fail if user exists (findUnique returns a value)', async () => {
      const newUser: any = {
        firstName: 'prince',
        lastName: 'ita',
        email: 'princeita@example.com',
        password: 'giberish',
        gender: Gender.male,
        accountType: 'mentee',
      };
      userServiceSpy.findUnique.mockImplementationOnce(() => {
        throw new HttpException('', 400);
      });
      try {
        await service.register(newUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
      expect(userServiceSpy.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          email: newUser.email,
        }),
        false
      );
      expect(userServiceSpy.create).not.toHaveBeenCalled();
      expect(queueSpy.add).not.toHaveBeenCalled();
      userServiceSpy.findUnique.mockRestore();
      queueSpy.add.mockRestore();
      userServiceSpy.create.mockRestore();
    });
  });

  describe('Login', () => {
    it('should return access token generated from payload', () => {
      const result = service.login({ email: 'johndoe@example.com', id: '1' });
      expect(result.accessToken).toEqual(expect.any(String));
    });
  });
});
