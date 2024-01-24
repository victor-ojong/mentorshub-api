import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const userRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest
      .fn()
      .mockImplementation((data) => ({ ...data, id: 'abcd-efg' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userService.findOne', () => {
    it('should call user repository findOne with an object the shape of user entity', async () => {
      const filter = { email: 'johndoe@example.com' };
      await service.findOne(filter);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: filter })
      );
    });
  });

  describe('userService.create', () => {
    it('should call user repository save with an object the shape of user entity', async () => {
      const user = {
        email: 'johndoe@example.com',
        phone: '081XXXXXXXX',
        countryCode: 'NG',
        fname: 'John',
        lname: 'Doe',
        password: '12322',
        handle: 'hello-233',
      };
      await service.create(user as any);
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining(user)
      );
    });
  });
});
