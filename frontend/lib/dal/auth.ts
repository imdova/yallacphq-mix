import { apiGet, apiPost } from "@/lib/api/client";
import {
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRefreshResponseSchema,
  authUserResponseSchema,
  changePasswordResponseSchema,
  forgotPasswordResponseSchema,
  loginBodySchema,
  resetPasswordResponseSchema,
  signupBodySchema,
} from "@/lib/api/contracts/auth";
import type { ChangePasswordBody } from "@/lib/api/contracts/auth";
import type { z } from "zod";

export type LoginInput = z.infer<typeof loginBodySchema>;
export type SignupInput = z.infer<typeof signupBodySchema>;

export async function authMe() {
  return apiGet("/api/auth/me", { schema: authMeResponseSchema });
}

export async function authLogin(input: LoginInput) {
  return apiPost("/api/auth/login", input, { schema: authUserResponseSchema });
}

export async function authSignup(input: SignupInput) {
  return apiPost("/api/auth/signup", input, { schema: authUserResponseSchema });
}

export async function authLogout() {
  return apiPost("/api/auth/logout", undefined, { schema: authLogoutResponseSchema });
}

/** Call refresh endpoint to get new access token. Used internally on 401. */
export async function authRefresh() {
  return apiPost("/api/auth/refresh", undefined, {
    schema: authRefreshResponseSchema,
    skipRefreshRetry: true,
  });
}

export async function authForgotPassword(email: string) {
  return apiPost("/api/auth/forgot-password", { email }, { schema: forgotPasswordResponseSchema });
}

export async function authResetPassword(token: string, newPassword: string) {
  return apiPost(
    "/api/auth/reset-password",
    { token, newPassword },
    { schema: resetPasswordResponseSchema }
  );
}

export async function changePassword(body: ChangePasswordBody) {
  return apiPost("/api/auth/change-password", body, {
    schema: changePasswordResponseSchema,
  });
}

