import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '../../common/auth/role';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private signAccessToken(user: { id: string; email: string; role: Role }) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async registerStudent(params: {
    name: string;
    email: string;
    password: string;
  }) {
    const existing = await this.users.findOne({ email: params.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = await this.users.createStudent({
      name: params.name,
      email: params.email,
      passwordHash,
    });

    const accessToken = await this.signAccessToken(user);
    return {
      accessToken,
      user,
    };
  }

  async login(params: { email: string; password: string }) {
    const user = await this.users.findOne({ email: params.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user);
    return {
      accessToken,
      user,
    };
  }
}
