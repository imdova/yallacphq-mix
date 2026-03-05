import { z } from "zod";
import { orderSchema, orderStatusSchema, paymentProviderSchema } from "./order";

export const checkoutPaymentMethodSchema = z.enum(["paypal", "card", "bank"]);

export const createPaymentSessionBodySchema = z.object({
  method: checkoutPaymentMethodSchema,
  courseTitle: z.string().min(1),
  currency: z.string().optional(),
  amount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0).optional(),
  promoCode: z.string().optional(),
  idempotencyKey: z.string().min(8).optional(),
  courseIds: z.array(z.string().min(1)).optional(),
  bankTransferProofUrl: z.string().optional(),
});

export type CreatePaymentSessionBody = z.infer<typeof createPaymentSessionBodySchema>;

export const createPaymentSessionResponseSchema = z.object({
  sessionId: z.string(),
  provider: paymentProviderSchema,
  order: orderSchema,
});

export type CreatePaymentSessionResponse = z.infer<typeof createPaymentSessionResponseSchema>;

export const confirmPaymentBodySchema = z.object({
  orderId: z.string().min(1),
  status: orderStatusSchema.optional(),
  transactionId: z.string().optional(),
});

export type ConfirmPaymentBody = z.infer<typeof confirmPaymentBodySchema>;

export const confirmPaymentResponseSchema = z.object({
  ok: z.literal(true),
  order: orderSchema,
});

export type ConfirmPaymentResponse = z.infer<typeof confirmPaymentResponseSchema>;

