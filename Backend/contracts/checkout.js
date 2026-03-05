"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaymentResponseSchema = exports.confirmPaymentBodySchema = exports.createPaymentSessionResponseSchema = exports.createPaymentSessionBodySchema = exports.checkoutPaymentMethodSchema = void 0;
const zod_1 = require("zod");
const order_1 = require("./order");
exports.checkoutPaymentMethodSchema = zod_1.z.enum(["paypal", "card", "bank"]);
exports.createPaymentSessionBodySchema = zod_1.z.object({
    method: exports.checkoutPaymentMethodSchema,
    courseTitle: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    amount: zod_1.z.number().min(0),
    discountAmount: zod_1.z.number().optional(),
    promoCode: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().min(8).optional(),
});
exports.createPaymentSessionResponseSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    provider: order_1.paymentProviderSchema,
    order: order_1.orderSchema,
});
exports.confirmPaymentBodySchema = zod_1.z.object({
    orderId: zod_1.z.string().min(1),
    status: order_1.orderStatusSchema.optional(),
    transactionId: zod_1.z.string().optional(),
});
exports.confirmPaymentResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    order: order_1.orderSchema,
});
//# sourceMappingURL=checkout.js.map