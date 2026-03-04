import { z } from "zod";
import { apiOkSchema } from "./common";

export const userRoleSchema = z.enum(["admin", "member", "viewer"]);

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  enrolled: z.boolean().optional(),
  phone: z.string().optional(),
  course: z.string().optional(),
  country: z.string().optional(),
  speciality: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApiUser = z.infer<typeof userSchema>;

export const createUserBodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: userRoleSchema,
  phone: z.string().optional(),
  course: z.string().optional(),
  country: z.string().optional(),
  speciality: z.string().optional(),
  enrolled: z.boolean().optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = createUserBodySchema.partial();

/**
 * Admin-only update payload.
 * Allows toggling enrollment status (used by AdminStudentsView "Enroll" flow).
 */
export const adminUpdateUserBodySchema = updateUserBodySchema.extend({
  enrolled: z.boolean().optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type AdminUpdateUserBody = z.infer<typeof adminUpdateUserBodySchema>;

export const listUsersResponseSchema = z.object({
  items: z.array(userSchema),
});

export type ListUsersResponse = z.infer<typeof listUsersResponseSchema>;

export const adminUserResponseSchema = z.object({
  user: userSchema,
});

export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;

export const adminUserNullableResponseSchema = z.object({
  user: userSchema.nullable(),
});

export type AdminUserNullableResponse = z.infer<typeof adminUserNullableResponseSchema>;

export const adminDeleteUserResponseSchema = apiOkSchema;
export type AdminDeleteUserResponse = z.infer<typeof adminDeleteUserResponseSchema>;

// Current user (/me)
export const currentUserResponseSchema = z.object({
  user: userSchema,
});

export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;

export const updateCurrentUserBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    course: z.string().optional(),
    country: z.string().optional(),
    speciality: z.string().optional(),
  })
  .partial();

export type UpdateCurrentUserBody = z.infer<typeof updateCurrentUserBodySchema>;

