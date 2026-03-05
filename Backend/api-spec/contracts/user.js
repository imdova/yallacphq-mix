"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrentUserBodySchema = exports.currentUserResponseSchema = exports.adminDeleteUserResponseSchema = exports.adminUserNullableResponseSchema = exports.adminUserResponseSchema = exports.listUsersResponseSchema = exports.adminUpdateUserBodySchema = exports.updateUserBodySchema = exports.createUserBodySchema = exports.userSchema = exports.userRoleSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.userRoleSchema = zod_1.z.enum(["admin", "member", "viewer"]);
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    role: exports.userRoleSchema,
    enrolled: zod_1.z.boolean().optional(),
    phone: zod_1.z.string().optional(),
    course: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    speciality: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.createUserBodySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(1),
    role: exports.userRoleSchema,
    phone: zod_1.z.string().optional(),
    course: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    speciality: zod_1.z.string().optional(),
    enrolled: zod_1.z.boolean().optional(),
});
exports.updateUserBodySchema = exports.createUserBodySchema.partial();
exports.adminUpdateUserBodySchema = exports.updateUserBodySchema.extend({
    enrolled: zod_1.z.boolean().optional(),
});
exports.listUsersResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.userSchema),
});
exports.adminUserResponseSchema = zod_1.z.object({
    user: exports.userSchema,
});
exports.adminUserNullableResponseSchema = zod_1.z.object({
    user: exports.userSchema.nullable(),
});
exports.adminDeleteUserResponseSchema = common_1.apiOkSchema;
exports.currentUserResponseSchema = zod_1.z.object({
    user: exports.userSchema,
});
exports.updateCurrentUserBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().optional(),
    course: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    speciality: zod_1.z.string().optional(),
})
    .partial();
//# sourceMappingURL=user.js.map