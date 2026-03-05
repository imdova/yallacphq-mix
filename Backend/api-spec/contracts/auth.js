"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordResponseSchema = exports.forgotPasswordResponseSchema = exports.authLogoutResponseSchema = exports.authUserResponseSchema = exports.authMeResponseSchema = exports.resetPasswordBodySchema = exports.forgotPasswordBodySchema = exports.loginBodySchema = exports.signupBodySchema = void 0;
const zod_1 = require("zod");
const user_1 = require("./user");
exports.signupBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.loginBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    rememberMe: zod_1.z.boolean().optional(),
});
exports.forgotPasswordBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.resetPasswordBodySchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8),
});
exports.authMeResponseSchema = zod_1.z.object({
    user: user_1.userSchema.nullable(),
});
exports.authUserResponseSchema = zod_1.z.object({
    user: user_1.userSchema,
});
exports.authLogoutResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
});
exports.forgotPasswordResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    token: zod_1.z.string().optional(),
});
exports.resetPasswordResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
});
//# sourceMappingURL=auth.js.map