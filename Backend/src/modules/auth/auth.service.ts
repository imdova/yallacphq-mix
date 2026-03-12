import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import type { StringValue } from 'ms';
import { Role } from '../../common/auth/role';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';

export type RefreshPayload = {
  sub: string;
  email: string;
  role: Role;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  private static readonly EMAIL_VERIFICATION_TTL_MINUTES = 60;
  private static readonly PASSWORD_RESET_TTL_MINUTES = 30;

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

  private hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private generateOtp(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private createChallenge(ttlMinutes: number) {
    const token = crypto.randomBytes(32).toString('hex');
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    return {
      token,
      tokenHash: this.hashValue(token),
      otp,
      otpHash: this.hashValue(otp),
      expiresAt,
    };
  }

  private ensureMailerConfigured() {
    if (!this.mail.isConfigured()) {
      throw new BadRequestException(
        'SMTP is not configured. Set SMTP_TRANSPORT and SMTP_DEMO_EMAIL.',
      );
    }
  }

  private buildFrontendUrl(pathname: string, params: Record<string, string>) {
    const url = new URL(this.mail.getAppUrl(pathname));
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  private async queueVerificationEmail(user: {
    id: string;
    email: string;
    name: string;
  }) {
    const challenge = this.createChallenge(
      AuthService.EMAIL_VERIFICATION_TTL_MINUTES,
    );
    await this.users.setEmailVerificationChallenge(user.id, {
      tokenHash: challenge.tokenHash,
      otpHash: challenge.otpHash,
      expiresAt: challenge.expiresAt,
    });

    if (!this.mail.isConfigured()) {
      this.logger.warn(
        `SMTP not configured. Skipping verification email for ${user.email}.`,
      );
      return;
    }

    const verificationUrl = this.buildFrontendUrl('/auth/verify-email', {
      token: challenge.token,
      email: user.email,
    });

    await this.mail.sendEmailVerification({
      to: user.email,
      name: user.name,
      verificationUrl,
      otp: challenge.otp,
      expiresInMinutes: AuthService.EMAIL_VERIFICATION_TTL_MINUTES,
    });
  }

  private async queuePasswordResetEmail(user: {
    id: string;
    email: string;
    name: string;
  }) {
    this.ensureMailerConfigured();

    const challenge = this.createChallenge(
      AuthService.PASSWORD_RESET_TTL_MINUTES,
    );
    await this.users.setPasswordResetChallenge(user.id, {
      tokenHash: challenge.tokenHash,
      otpHash: challenge.otpHash,
      expiresAt: challenge.expiresAt,
    });

    const resetUrl = this.buildFrontendUrl('/auth/reset-password', {
      token: challenge.token,
      email: user.email,
    });

    await this.mail.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      otp: challenge.otp,
      expiresInMinutes: AuthService.PASSWORD_RESET_TTL_MINUTES,
    });
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

    try {
      await this.queueVerificationEmail({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      this.logger.warn(
        `User ${user.email} created but verification email failed: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(params: { email: string; password: string }) {
    const user = await this.users.findByEmail(params.email);
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

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { success: true as const };
    }

    await this.queuePasswordResetEmail({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true as const };
  }

  async resetPassword(params: {
    token?: string;
    email?: string;
    otp?: string;
    newPassword: string;
  }) {
    let user = null;

    if (params.token?.trim()) {
      user = await this.users.findByPasswordResetTokenHash(
        this.hashValue(params.token.trim()),
      );
    } else if (params.email?.trim() && params.otp?.trim()) {
      user = await this.users.findByPasswordResetOtp(
        params.email.trim(),
        this.hashValue(params.otp.trim()),
      );
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token / otp');
    }

    const passwordHash = await bcrypt.hash(params.newPassword, 10);
    await this.users.setPasswordHash(user.id, passwordHash);
    return { ok: true as const };
  }

  async verifyEmail(params: {
    token?: string;
    email?: string;
    otp?: string;
  }) {
    let user = null;

    if (params.token?.trim()) {
      user = await this.users.findByEmailVerificationTokenHash(
        this.hashValue(params.token.trim()),
      );
    } else if (params.email?.trim() && params.otp?.trim()) {
      user = await this.users.findByEmailVerificationOtp(
        params.email.trim(),
        this.hashValue(params.otp.trim()),
      );
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token / otp');
    }

    await this.users.markEmailVerified(user.id);
    return { ok: true as const };
  }

  async resendVerificationEmail(email: string) {
    this.ensureMailerConfigured();

    const user = await this.users.findByEmail(email);
    if (!user || user.emailVerified) {
      return { success: true as const };
    }

    await this.queueVerificationEmail({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true as const };
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
