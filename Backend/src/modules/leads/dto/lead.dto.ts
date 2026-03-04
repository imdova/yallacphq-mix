import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z
    .string()
    .email()
    .transform((v) => v.trim().toLowerCase()),
  phone: z.string().optional().default(''),
  source: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
