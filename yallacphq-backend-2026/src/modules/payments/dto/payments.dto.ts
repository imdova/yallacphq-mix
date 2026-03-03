import { z } from 'zod';

export const createCheckoutSchema = z.object({
  orderId: z.string().min(1),
  amountCents: z.number().int().min(0),
  currency: z.string().min(3).max(10).default('usd'),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
