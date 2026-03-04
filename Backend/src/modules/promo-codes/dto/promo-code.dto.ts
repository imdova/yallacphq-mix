import { z } from 'zod';

export const createPromoCodeSchema = z.object({
  code: z
    .string()
    .min(3)
    .transform((v) => v.trim().toUpperCase()),
  percentOff: z.number().int().min(1).max(100),
  active: z.boolean().optional().default(true),
  expiresAt: z.coerce.date().optional(),
});

export type CreatePromoCodeDto = z.infer<typeof createPromoCodeSchema>;
