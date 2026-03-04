import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  priceCents: z.number().int().min(0),
  published: z.boolean().optional().default(false),
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;
