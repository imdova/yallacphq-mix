import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../../common/auth/role';
import { UsersService } from '../../users/users.service';

function cookieExtractor(req: unknown): string | null {
  if (!req || typeof req !== 'object') return null;
  const cookies = (req as { cookies?: unknown }).cookies;
  if (!cookies || typeof cookies !== 'object') return null;
  const token = (cookies as Record<string, unknown>)['access_token'];
  return typeof token === 'string' && token.trim() ? token : null;
}

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return { sub: user.id, email: user.email, role: user.role };
  }
}
