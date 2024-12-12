import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth-guard';
import { User } from '../users/user.entity';
import { UserDto } from '../users/user-dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    updateUser: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    activate: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        first_name: 'Test',
        last_name: 'User',
        isActive: true,
        activationToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
      };

      mockAuthService.register.mockResolvedValue({ message: 'User registered!' });

      const result = await controller.register(user);
      expect(result).toEqual({ message: 'User registered!' });
      expect(mockAuthService.register).toHaveBeenCalledWith(user);
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updatedUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        first_name: 'Updated',
        last_name: 'User',
        isActive: true,
        activationToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resetToken: null,
      };

      mockAuthService.updateUser.mockResolvedValue(updatedUser);

      const req = { user: { id: 1 } };
      const result = await controller.updateUser(req, 'Updated', 'User');
      expect(result).toEqual(updatedUser);
      expect(mockAuthService.updateUser).toHaveBeenCalledWith(1, {
        firstName: 'Updated',
        lastName: 'User',
      });
    });
  });

  describe('login', () => {
    it('should log in a user', async () => {
      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        isActive: true,
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue({ token: 'jwt-token' });

      const result = await controller.login(userDto);
      expect(result).toEqual({ token: 'jwt-token' });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        userDto.email,
        userDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should return error for invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      const userDto: UserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const result = await controller.login(userDto);
      expect(result).toEqual({ message: 'Invalid Credentials' });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        userDto.email,
        userDto.password,
      );
    });
  });

  describe('activate', () => {
    it('should activate a user', async () => {
      mockAuthService.activate.mockResolvedValue(undefined);

      const result = await controller.activate('activation-token');
      expect(result).toEqual({ message: 'User activated successfully!' });
      expect(mockAuthService.activate).toHaveBeenCalledWith('activation-token');
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({ message: 'Reset email sent' });

      const result = await controller.forgotPassword('test@example.com');
      expect(result).toEqual({ message: 'Reset email sent' });
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset the password', async () => {
      mockAuthService.resetPassword.mockResolvedValue({ message: 'Password reset successful' });

      const result = await controller.resetPassword('reset-token', 'newPassword123');
      expect(result).toEqual({ message: 'Password reset successful' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'reset-token',
        'newPassword123',
      );
    });
  });
});
