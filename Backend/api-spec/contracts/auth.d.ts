import { z } from "zod";
export declare const signupBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type SignupBody = z.infer<typeof signupBodySchema>;
export declare const loginBodySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export declare const forgotPasswordBodySchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export declare const resetPasswordBodySchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export declare const authMeResponseSchema: z.ZodObject<{
    user: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;
export declare const authUserResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        role: z.ZodEnum<{
            admin: "admin";
            member: "member";
            viewer: "viewer";
        }>;
        enrolled: z.ZodOptional<z.ZodBoolean>;
        phone: z.ZodOptional<z.ZodString>;
        course: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        speciality: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;
export declare const authLogoutResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>;
export declare const forgotPasswordResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    token: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ForgotPasswordResponse = z.infer<typeof forgotPasswordResponseSchema>;
export declare const resetPasswordResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
