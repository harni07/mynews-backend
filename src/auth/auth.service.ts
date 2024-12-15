import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import * as nodemailer from 'nodemailer';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/user-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const normalizedEmail  = email.toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail  },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const result = { ...user };
      delete result.password;
      return result as Omit<User, 'password'>;
    }
    return null;
  }
  

  async register(user: User) {
    const errors = await validate(user);
    if (errors.length > 0) {
      const _errors = {};
      errors.forEach((el) => {
        const prop = el.property;
        Object.entries(el.constraints).forEach((constraint) => {
          _errors[prop] = `${constraint[1]}`;
        });
      });
      throw new BadRequestException({
        message: 'Input data validation failed',
        _errors,
      });
    } else {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;

      const activationToken = uuid.v4();
      user.activationToken = activationToken;

      user.email = user.email.toLowerCase();

      try {
        await this.usersRepository.save(user);

        await this.sendActivationEmail(
          user.email,
          activationToken,
          user.first_name,
        );
        return {
          message:
            'Activation email has been sent to your email. Please confirm your email.',
        };
      } catch (e) {
        if (e.code === '23505') {
          if (e.detail.includes('email')) {
            throw new BadRequestException(
              'User with this email already exists',
            );
          }
        } else if (e.code === '23502') {
          throw new BadRequestException('All fields are required');
        } else {
          throw new InternalServerErrorException(
            e.message || 'Something went wrong',
          );
        }
      }
    }
  }

  async login(user: Omit<UserDto, 'password'>) {
    user.email = user.email.toLowerCase();
    const userInDb: User = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', {
        email: user.email,
      })
      .getOne();

    if (!userInDb) {
      throw new NotFoundException('User not found!');
    }

    if (!userInDb.isActive) {
      throw new ForbiddenException('Account is not activated!');
    }

    const payload = { email: userInDb.email, sub: userInDb.id };
    return {
      access_token: this.jwtService.sign(payload),
      id: userInDb.id,
      first_name: userInDb.first_name,
      last_name: userInDb.last_name,
      email: user.email,
    };
  }

  async activate(token: string) {
    const user = await this.usersRepository.findOne({
      where: { activationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Activation link is invalid!');
    }

    user.isActive = true;
    user.activationToken = null;
    await this.usersRepository.save(user);
  }

  async sendActivationEmail(email: string, token: string, firstName: string) {
    email = email.toLowerCase();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'journal4x@gmail.com',
        pass: 'qxta yeyl drpx qvpq',
      },
    });

    const url = `http://localhost:3000/auth/activate/${token}`;
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  .email-container {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      padding: 20px;
                      width: 100%;
                      max-width: 600px;
                      margin: auto;
                  }
          
                  .email-header {
                      background-color: #fff;
                      padding: 20px;
                      text-align: center;
                  }
          
                  .email-body {
                      background-color: #fff;
                      padding: 20px;
                  }
          
                  .reset-button {
                      display: block;
                      width: 100%;
                      max-width: 200px;
                      margin: 20px auto;
                      padding: 10px 20px;
                      background-color: #4CAF50;
                      color: #fff !important;
                      text-align: center;
                      border: none;
                      text-decoration: none;
                      font-weight: bold;
                      border-radius: 4px;
                  }
          
                  .email-footer {
                      text-align: center;
                      margin-top: 20px;
                      color: #888;
                  }
              </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-body">
                    <h2>Activate your account</h2>
                    <p>Hello ${firstName},</p>
                    <p>Please click on the button or on this link to activate your account: <a href="${url}">${url}</a></p>
                    <a href="${url}" class="reset-button">ACTIVATE ACCOUNT</a>
                </div>
                <div class="email-footer">
                    Regards,<br>
                    My News
                </div>
            </div>
        </body>
        </html>
        `;

    transporter.sendMail({
      from: 'My News <no-reply@mynews.com>',
      to: email,
      subject: 'Activate your account',
      html: htmlContent,
    });
  }

  async forgotPassword(email: string) {
    email = email.toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const resetToken = uuid.v4();
    user.resetToken = resetToken;
    await this.usersRepository.save(user);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'journal4x@gmail.com',
        pass: 'qxta yeyl drpx qvpq',
      },
    });
    const url = `http://localhost:3000/reset-password/${resetToken}`;

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  .email-container {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      padding: 20px;
                      width: 100%;
                      max-width: 600px;
                      margin: auto;
                  }
          
                  .email-header {
                      background-color: #fff;
                      padding: 20px;
                      text-align: center;
                  }
          
                  .email-body {
                      background-color: #fff;
                      padding: 20px;
                  }
          
                  .reset-button {
                      display: block;
                      width: 100%;
                      max-width: 200px;
                      margin: 20px auto;
                      padding: 10px 20px;
                      background-color: #4CAF50;
                      color: #fff !important;
                      text-align: center;
                      border: none;
                      text-decoration: none;
                      font-weight: bold;
                      border-radius: 4px;
                  }
          
                  .email-footer {
                      text-align: center;
                      margin-top: 20px;
                      color: #888;
                  }
              </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-body">
                    <h2>Reset your password</h2>
                    <p>Hello ${user.first_name},</p>
                    <p>You recently requested to reset your password. To complete your request, please click the link below:</p>
                    <a href="${url}" class="reset-button">RESET PASSWORD</a>
                </div>
                <div class="email-footer">
                    Regards,<br>
                    My News
                </div>
            </div>
        </body>
        </html>
        `;

    transporter.sendMail({
      from: 'Test <no-reply@test.com>',
      to: email,
      subject: 'Rest your password',
      html: htmlContent,
    });

    return {
      message: 'Reset password email has been sent! Check your email inbox',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepository.findOne({
      where: { resetToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid password reset token');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null; 
    await this.usersRepository.save(user);
    return {
      message:
        'Your password has been successfully reset. Go ahead and login to your account',
    };
  }

  async updateUser(
    id: number,
    updateData: { firstName: string; lastName: string },
  ) {
    await this.usersRepository.update(id, {
      first_name: updateData.firstName,
      last_name: updateData.lastName,
    });
    return await this.usersRepository.findOne({
      where: { id: id },
      select: ['id', 'first_name', 'last_name', 'email'],
    });
  }
}
