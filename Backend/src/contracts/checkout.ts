import { z } from 'zod';
import { orderSchema, orderStatusSchema, paymentProviderSchema } from './order';

export const checkoutPaymentMethodSchema = z.enum(['paypal', 'card', 'bank', 'paymob']);

const billingDataSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(1),
  city: z.string().optional(),
  country: z.string().optional(),
});

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
  /** Required when method is paymob (billing data for Paymob intention). */
  billingData: billingDataSchema.optional(),
  /** When method is paymob: which integration to use (card, ewallet, cagg, kiosk). Omit to use all configured. */
  paymobIntegrationType: z.enum(['card', 'ewallet', 'cagg', 'kiosk']).optional(),
});

export type CreatePaymentSessionBody = z.infer<
  typeof createPaymentSessionBodySchema
>;

export const createPaymentSessionResponseSchema = z.object({
  sessionId: z.string(),
  provider: paymentProviderSchema,
  order: orderSchema,
  /** Present when provider is paymob; redirect user to this URL to complete payment. */
  paymobRedirectUrl: z.string().url().optional(),
});

export type CreatePaymentSessionResponse = z.infer<
  typeof createPaymentSessionResponseSchema
>;

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

export type ConfirmPaymentResponse = z.infer<
  typeof confirmPaymentResponseSchema
>;
