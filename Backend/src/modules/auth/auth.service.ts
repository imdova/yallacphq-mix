import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';
import { Role } from '../../common/auth/role';
import { UsersService } from '../users/users.service';

export type RefreshPayload = {
  sub: string;
  email: string;
  role: Role;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshExpiresIn(): StringValue {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as StringValue;
  }

  private signAccessToken(user: { id: string; email: string; role: Role }) {
    return this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private signRefreshToken(user: { id: string; email: string; role: Role }) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
      },
      { expiresIn: this.getRefreshExpiresIn() },
    );
  }

  async registerStudent(params: {
    name: string;
    email: string;
    password: string;
    speciality?: string;
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
      speciality: params.speciality,
    });

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(params: { email: string; password: string }) {
    const user = await this.users.findOne({ email: params.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken?.trim()) {
      throw new UnauthorizedException('Refresh token required');
    }
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    const accessToken = await this.signAccessToken(user);
    const newRefreshToken = await this.signRefreshToken(user);
    return { accessToken, refreshToken: newRefreshToken, user };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await this.users.setPasswordHash(userId, passwordHash);
    if (!updated) throw new UnauthorizedException('User not found');
    return updated;
  }
}
