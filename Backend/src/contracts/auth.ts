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

export const googleExchangeCodeBodySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export type GoogleExchangeCodeBody = z.infer<typeof googleExchangeCodeBodySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'OTP must be 6 digits');

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1).optional(),
  email: z.string().email().optional(),
  otp: otpSchema.optional(),
  newPassword: z.string().min(8),
}).superRefine((value, ctx) => {
  if (!value.token && !(value.email && value.otp)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['token'],
      message: 'Provide either token or email + otp',
    });
  }
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const verifyEmailBodySchema = z.object({
  token: z.string().min(1).optional(),
  email: z.string().email().optional(),
  otp: otpSchema.optional(),
}).superRefine((value, ctx) => {
  if (!value.token && !(value.email && value.otp)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['token'],
      message: 'Provide either token or email + otp',
    });
  }
});

export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;

export const resendVerificationBodySchema = z.object({
  email: z.string().email(),
});

export type ResendVerificationBody = z.infer<typeof resendVerificationBodySchema>;

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

export const googleExchangeCodeResponseSchema = authUserResponseSchema.extend({
  next: z.string().min(1),
});

export type GoogleExchangeCodeResponse = z.infer<
  typeof googleExchangeCodeResponseSchema
>;

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

export const verifyEmailResponseSchema = z.object({
  ok: z.literal(true),
});

export type VerifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;

export const resendVerificationResponseSchema = z.object({
  success: z.literal(true),
});

export type ResendVerificationResponse = z.infer<
  typeof resendVerificationResponseSchema
>;

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

export const changePasswordResponseSchema = z.object({
  ok: z.literal(true),
});

export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
