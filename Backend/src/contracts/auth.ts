import { z } from 'zod';
import { userSchema } from './user';

export const signupBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  speciality: z.string().min(1, 'Please select your specialty'),
});

export type SignupBody = z.infer<typeof signupBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const authMeResponseSchema = z.object({
  user: userSchema.nullable(),
});

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export const authUserResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: userSchema,
});

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

export const authLogoutResponseSchema = z.object({
  ok: z.literal(true),
});

export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>;

export const authRefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export type AuthRefreshResponse = z.infer<typeof authRefreshResponseSchema>;

export const forgotPasswordResponseSchema = z.object({
  success: z.literal(true),
  token: z.string().optional(),
});

export type ForgotPasswordResponse = z.infer<
  typeof forgotPasswordResponseSchema
>;

export const resetPasswordResponseSchema = z.object({
  ok: z.literal(true),
});

export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

export const changePasswordResponseSchema = z.object({
  ok: z.literal(true),
});

export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
