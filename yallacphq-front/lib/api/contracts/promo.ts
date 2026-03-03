import { z } from "zod";
import { apiOkSchema } from "./common";

export const promoDiscountTypeSchema = z.enum(["percentage", "fixed"]);

export const promoCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  discountType: promoDiscountTypeSchema,
  discountValue: z.number(),
  active: z.boolean(),
  maxUsageEnabled: z.boolean(),
  maxUsage: z.number().nullable(),
  perCustomerLimitEnabled: z.boolean(),
  perCustomerLimit: z.number().nullable(),
  restrictToProductEnabled: z.boolean(),
  productId: z.string().nullable(),
  usageCount: z.number(),
});

export type ApiPromoCode = z.infer<typeof promoCodeSchema>;

export const createPromoCodeBodySchema = z.object({
  code: z.string().min(1),
  discountType: promoDiscountTypeSchema,
  discountValue: z.number().min(0),
  active: z.boolean().optional(),
  maxUsageEnabled: z.boolean().optional(),
  maxUsage: z.number().nullable().optional(),
  perCustomerLimitEnabled: z.boolean().optional(),
  perCustomerLimit: z.number().nullable().optional(),
  restrictToProductEnabled: z.boolean().optional(),
  productId: z.string().nullable().optional(),
});

export type CreatePromoCodeBody = z.infer<typeof createPromoCodeBodySchema>;

export const updatePromoCodeBodySchema = createPromoCodeBodySchema.partial();

export type UpdatePromoCodeBody = z.infer<typeof updatePromoCodeBodySchema>;

export const listPromoCodesResponseSchema = z.object({
  items: z.array(promoCodeSchema),
});

export type ListPromoCodesResponse = z.infer<typeof listPromoCodesResponseSchema>;

export const promoCodeResponseSchema = z.object({
  promo: promoCodeSchema,
});

export type PromoCodeResponse = z.infer<typeof promoCodeResponseSchema>;

export const promoCodeNullableResponseSchema = z.object({
  promo: promoCodeSchema.nullable(),
});

export type PromoCodeNullableResponse = z.infer<typeof promoCodeNullableResponseSchema>;

export const adminDeletePromoCodeResponseSchema = apiOkSchema;
export type AdminDeletePromoCodeResponse = z.infer<typeof adminDeletePromoCodeResponseSchema>;

export const validatePromoCodeBodySchema = z.object({
  courseId: z.string().min(1),
  code: z.string().min(1),
});

export type ValidatePromoCodeBody = z.infer<typeof validatePromoCodeBodySchema>;

export const validatePromoCodeResponseSchema = z.object({
  ok: z.literal(true),
  promo: promoCodeSchema,
  discountAmount: z.number().min(0),
  discountedTotal: z.number().min(0),
});

export type ValidatePromoCodeResponse = z.infer<typeof validatePromoCodeResponseSchema>;

