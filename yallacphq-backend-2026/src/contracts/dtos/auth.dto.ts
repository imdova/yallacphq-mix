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
  @ApiProperty({ example: 'reset_token_123', minLength: 1 })
  token!: string;

  @ApiProperty({ example: 'NewStrongPassw0rd!', minLength: 8 })
  newPassword!: string;
}

export class ResetPasswordResponseDto extends ApiOkDto {}
