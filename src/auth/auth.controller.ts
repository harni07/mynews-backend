import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ValidationPipe,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { UserDto } from '../users/user-dto';
import { JwtAuthGuard } from './jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) user: User) {
    return this.authService.register(user);
  }

  @Patch('user')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Request() req,
    @Body('first_name') firstName: string,
    @Body('last_name') lastName: string,
  ): Promise<User> {
    const { id } = req.user;
    const updatedUser = await this.authService.updateUser(id, {
      firstName,
      lastName,
    });
    return updatedUser;
  }

  @Post('login')
  async login(@Body(ValidationPipe) user: UserDto) {
    const userInDb = await this.authService.validateUser(
      user.email,
      user.password,
    );
    if (!userInDb) {
      return {
        message: 'Invalid Credentials',
      };
    }
    return this.authService.login(userInDb);
  }

  @Get('activate/:token')
  async activate(@Param('token') token: string) {
    await this.authService.activate(token);
    return {
      message: 'User activated successfully!',
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(token, newPassword);
  }
}
