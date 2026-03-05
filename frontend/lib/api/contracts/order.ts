import { z } from "zod";
import { apiOkSchema } from "./common";

export const orderStatusSchema = z.enum(["paid", "pending", "failed", "refunded"]);
export const paymentProviderSchema = z.enum(["paymob", "stripe", "manual"]);
export const paymentMethodSchema = z.enum(["card", "wallet", "cash"]);

export const orderSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  studentPhone: z.string().optional(),
  courseTitle: z.string(),
  currency: z.string(),
  amount: z.number(),
  discountAmount: z.number().optional(),
  promoCode: z.string().optional(),
  provider: paymentProviderSchema,
  paymentMethod: paymentMethodSchema.optional(),
  status: orderStatusSchema,
  transactionId: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
  bankTransferProofUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  paidAt: z.string().optional(),
  refundedAt: z.string().optional(),
});

export type ApiOrder = z.infer<typeof orderSchema>;

export const createOrderBodySchema = z.object({
  studentName: z.string().min(1),
  studentEmail: z.string().email(),
  studentPhone: z.string().optional(),
  courseTitle: z.string().min(1),
  currency: z.string().optional(),
  amount: z.number().min(0),
  discountAmount: z.number().optional(),
  promoCode: z.string().optional(),
  provider: paymentProviderSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  status: orderStatusSchema.optional(),
  transactionId: z.string().optional(),
  paidAt: z.string().optional(),
  refundedAt: z.string().optional(),
  courseIds: z.array(z.string().min(1)).optional(),
  bankTransferProofUrl: z.string().optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

export const updateOrderBodySchema = createOrderBodySchema.partial().extend({
  status: orderStatusSchema.optional(),
});

export type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>;

export const listOrdersResponseSchema = z.object({
  items: z.array(orderSchema),
});

export type ListOrdersResponse = z.infer<typeof listOrdersResponseSchema>;

export const orderResponseSchema = z.object({
  order: orderSchema,
});

export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const orderNullableResponseSchema = z.object({
  order: orderSchema.nullable(),
});

export type OrderNullableResponse = z.infer<typeof orderNullableResponseSchema>;

export const adminDeleteOrderResponseSchema = apiOkSchema;
export type AdminDeleteOrderResponse = z.infer<typeof adminDeleteOrderResponseSchema>;

