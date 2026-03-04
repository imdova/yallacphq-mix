import { z } from "zod";

const roleEnum = z.enum(["admin", "student"]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  role: roleEnum,
  phone: z.string().max(50).optional(),
  course: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  speciality: z.string().max(100).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
