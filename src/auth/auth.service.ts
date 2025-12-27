// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { RegisterInput, AuthInput } from './dto/auth.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput) {
    const { email, password } = registerInput;

    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    return this.generateToken(user.id, user.email);
  }

  async login(authInput: AuthInput) {
    const user = await this.usersRepository.findByEmail(authInput.email);
    if (!user)
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    const isPasswordValid = await bcrypt.compare(
      authInput.password,
      user.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    return this.generateToken(user.id, user.email);
  }

  private generateToken(userId: number, email: string) {
    return {
      access_token: this.jwtService.sign({ sub: userId, email }),
    };
  }
}
