import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'test1@example.com',
          password: 'hashedPassword1',
          first_name: 'Test1',
          last_name: 'User1',
          isActive: true,
          activationToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          resetToken: null,
        },
        {
          id: 2,
          email: 'test2@example.com',
          password: 'hashedPassword2',
          first_name: 'Test2',
          last_name: 'User2',
          isActive: true,
          activationToken: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          resetToken: null,
        },
      ];

      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test1@example.com',
        password: 'hashedPassword1',
        first_name: 'Test1',
        last_name: 'User1',
        isActive: true,
        activationToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
      };

      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
    });

    it('should handle user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      const result = await controller.getUserById(999);
      expect(result).toBeNull();
      expect(mockUserService.getUserById).toHaveBeenCalledWith(999);
    });
  });
});
