import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column()
  @MinLength(8, { message: 'Password should be minimum 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @Column()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @Column()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  activationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  resetToken: string;
}
