import { z } from "zod";

export const createPromoCodeSchema = z.object({
  code: z.string().min(1, "Promo code is required").max(80),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(0, "Discount value must be 0 or more"),
  active: z.boolean().optional(),
  maxUsageEnabled: z.boolean().optional(),
  maxUsage: z.coerce.number().int().min(0).nullable().optional(),
  perCustomerLimitEnabled: z.boolean().optional(),
  perCustomerLimit: z.coerce.number().int().min(0).nullable().optional(),
  restrictToProductEnabled: z.boolean().optional(),
  productId: z.string().nullable().optional(),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();

export type CreatePromoCodeSchema = z.infer<typeof createPromoCodeSchema>;
export type UpdatePromoCodeSchema = z.infer<typeof updatePromoCodeSchema>;
