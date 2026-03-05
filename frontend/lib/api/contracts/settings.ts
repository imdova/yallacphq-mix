import { z } from "zod";

export const studentFieldOptionsResponseSchema = z.object({
  countries: z.array(z.string()),
  specialities: z.array(z.string()),
  categories: z.array(z.string()),
});

export type StudentFieldOptionsResponse = z.infer<typeof studentFieldOptionsResponseSchema>;

export const updateStudentFieldOptionsBodySchema = z.object({
  countries: z.array(z.string()).optional(),
  specialities: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
});

export type UpdateStudentFieldOptionsBody = z.infer<typeof updateStudentFieldOptionsBodySchema>;
