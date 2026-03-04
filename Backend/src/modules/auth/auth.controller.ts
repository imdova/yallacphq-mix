import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  ApiBody,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Version } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ApiErrorDto } from '../../contracts/dtos/common.dto';
import {
  AuthLogoutResponseDto,
  AuthMeResponseDto,
  AuthRefreshResponseDto,
  AuthUserResponseDto,
  ForgotPasswordBodyDto,
  ForgotPasswordResponseDto,
  LoginBodyDto,
  ResetPasswordBodyDto,
  ResetPasswordResponseDto,
  SignupBodyDto,
} from '../../contracts/dtos';
import { AuthService } from './auth.service';
import {
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRefreshResponseSchema,
  authUserResponseSchema,
  forgotPasswordBodySchema,
  forgotPasswordResponseSchema,
  loginBodySchema,
  resetPasswordBodySchema,
  resetPasswordResponseSchema,
  signupBodySchema,
} from '../../contracts';
import type {
  ForgotPasswordBody,
  LoginBody,
  ResetPasswordBody,
  SignupBody,
} from '../../contracts';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { toApiUser } from '../users/user.mapper';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Post('register')
  @Version('1')
  @ApiOperation({
    summary: 'Signup',
    description: 'Create a new student account',
  })
  @ApiBody({ type: SignupBodyDto })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @UsePipes(new ZodValidationPipe(signupBodySchema))
  @ResponseSchema(authUserResponseSchema)
  async register(
    @Body() body: SignupBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.auth.registerStudent(body);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return { accessToken, user: toApiUser(user) };
  }

  @Post('signup')
  @Version('1')
  @ApiOperation({
    summary: 'Signup (contract alias)',
    description: 'Alias for frontend contract route: POST /api/auth/signup',
  })
  @ApiBody({ type: SignupBodyDto })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @UsePipes(new ZodValidationPipe(signupBodySchema))
  @ResponseSchema(authUserResponseSchema)
  signup(@Body() body: SignupBody, @Res({ passthrough: true }) res: Response) {
    return this.register(body, res);
  }

  @Post('login')
  @Version('1')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate and receive an access token',
  })
  @ApiBody({ type: LoginBodyDto })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @UsePipes(new ZodValidationPipe(loginBodySchema))
  @ResponseSchema(authUserResponseSchema)
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.auth.login(body);
    const rememberMe = Boolean(body.rememberMe);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 30 : undefined,
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7,
    });
    return { accessToken, user: toApiUser(user) };
  }

  @Post('logout')
  @Version('1')
  @ApiOperation({
    summary: 'Logout',
    description: 'Clear authentication cookie',
  })
  @ApiOkResponse({ type: AuthLogoutResponseDto })
  @ResponseSchema(authLogoutResponseSchema)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @Post('refresh')
  @Version('1')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token (cookie) for a new access token',
  })
  @ApiOkResponse({ type: AuthRefreshResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @ResponseSchema(authRefreshResponseSchema)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req.cookies as Record<string, string | undefined> | undefined)?.refresh_token ?? '';
    const { accessToken, refreshToken: newRefreshToken } = await this.auth.refresh(refreshToken);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return { accessToken };
  }

  @Post('forgot-password')
  @Version('1')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Request a password reset',
  })
  @ApiBody({ type: ForgotPasswordBodyDto })
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @UsePipes(new ZodValidationPipe(forgotPasswordBodySchema))
  @ResponseSchema(forgotPasswordResponseSchema)
  forgotPassword(@Body() body: ForgotPasswordBody) {
    void body;
    return { success: true };
  }

  @Post('reset-password')
  @Version('1')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password using reset token',
  })
  @ApiBody({ type: ResetPasswordBodyDto })
  @ApiOkResponse({ type: ResetPasswordResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorDto })
  @UsePipes(new ZodValidationPipe(resetPasswordBodySchema))
  @ResponseSchema(resetPasswordResponseSchema)
  resetPassword(@Body() body: ResetPasswordBody) {
    void body;
    return { ok: true };
  }

  @Get('me')
  @Version('1')
  @ApiOperation({
    summary: 'Current user',
    description: 'Return the current authenticated user',
  })
  @ApiOkResponse({ type: AuthMeResponseDto })
  @ApiAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ResponseSchema(authMeResponseSchema)
  async me(@CurrentUser() user: RequestUser | null) {
    if (!user) return { user: null };
    const dbUser = await this.users.findById(user.sub);
    return { user: dbUser ? toApiUser(dbUser) : null };
  }
}
