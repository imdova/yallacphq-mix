import { ApiProperty } from '@nestjs/swagger';
import { ApiOkDto, ApiSuccessDto } from './common.dto';
import { ApiUserDto } from './user.dto';

export class SignupBodyDto {
  @ApiProperty({ example: 'Jane Student', minLength: 1 })
  name!: string;

  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'StrongPassw0rd!', minLength: 8 })
  password!: string;

  @ApiProperty({
    example: 'Quality Management',
    description: 'Healthcare specialty (from admin-configured list)',
    minLength: 1,
  })
  speciality!: string;
}

export class LoginBodyDto {
  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'StrongPassw0rd!' })
  password!: string;

  @ApiProperty({
    required: false,
    description: 'If true, server may set a longer-lived cookie session',
    example: true,
  })
  rememberMe?: boolean;
}

export class GoogleExchangeCodeBodyDto {
  @ApiProperty({ example: '4/0AbCDefGhIjK' })
  code!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9.google_state' })
  state!: string;
}

export class AuthUserResponseDto {
  @ApiProperty({
    description: 'JWT access token (also set as httpOnly cookie)',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWYzYyIsImVtYWlsIjoic3R1ZGVudEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50In0.abc123',
  })
  accessToken!: string;

  @ApiProperty({ type: ApiUserDto })
  user!: ApiUserDto;
}

export class AuthMeResponseDto {
  @ApiProperty({
    type: ApiUserDto,
    nullable: true,
    description: 'Authenticated user or null when not logged in',
  })
  user!: ApiUserDto | null;
}

export class AuthLogoutResponseDto extends ApiOkDto {}

export class AuthRefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token (also set as httpOnly cookie)',
  })
  accessToken!: string;
}

export class GoogleExchangeCodeResponseDto extends AuthUserResponseDto {
  @ApiProperty({
    description: 'Safe relative path to redirect the user after Google login',
    example: '/dashboard',
  })
  next!: string;
}

export class ForgotPasswordBodyDto {
  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;
}

export class ForgotPasswordResponseDto extends ApiSuccessDto {
  @ApiProperty({
    required: false,
    description: 'Dev-only reset token (if enabled)',
    example: 'reset_token_123',
  })
  token?: string;
}

export class ResetPasswordBodyDto {
  @ApiProperty({
    required: false,
    example: 'reset_token_123',
    minLength: 1,
    description: 'Reset link token',
  })
  token?: string;

  @ApiProperty({
    required: false,
    example: 'student@example.com',
    format: 'email',
    description: 'Required when resetting with OTP',
  })
  email?: string;

  @ApiProperty({
    required: false,
    example: '123456',
    minLength: 6,
    maxLength: 6,
    description: '6-digit OTP code sent by email',
  })
  otp?: string;

  @ApiProperty({ example: 'NewStrongPassw0rd!', minLength: 8 })
  newPassword!: string;
}

export class ResetPasswordResponseDto extends ApiOkDto {}

export class VerifyEmailBodyDto {
  @ApiProperty({
    required: false,
    example: 'verify_token_123',
    minLength: 1,
    description: 'Verification link token',
  })
  token?: string;

  @ApiProperty({
    required: false,
    example: 'student@example.com',
    format: 'email',
    description: 'Required when verifying with OTP',
  })
  email?: string;

  @ApiProperty({
    required: false,
    example: '123456',
    minLength: 6,
    maxLength: 6,
    description: '6-digit OTP code sent by email',
  })
  otp?: string;
}

export class VerifyEmailResponseDto extends ApiOkDto {}

export class ResendVerificationBodyDto {
  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;
}

export class ResendVerificationResponseDto extends ApiSuccessDto {}

export class ChangePasswordBodyDto {
  @ApiProperty({ example: 'CurrentPassw0rd!', description: 'Current password' })
  currentPassword!: string;

  @ApiProperty({ example: 'NewStrongPassw0rd!', minLength: 8 })
  newPassword!: string;
}

export class ChangePasswordResponseDto extends ApiOkDto {}
