"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteOrderResponseSchema = exports.orderNullableResponseSchema = exports.orderResponseSchema = exports.listOrdersResponseSchema = exports.updateOrderBodySchema = exports.createOrderBodySchema = exports.orderSchema = exports.paymentMethodSchema = exports.paymentProviderSchema = exports.orderStatusSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.orderStatusSchema = zod_1.z.enum(["paid", "pending", "failed", "refunded"]);
exports.paymentProviderSchema = zod_1.z.enum(["paymob", "stripe", "manual"]);
exports.paymentMethodSchema = zod_1.z.enum(["card", "wallet", "cash"]);
exports.orderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    studentName: zod_1.z.string(),
    studentEmail: zod_1.z.string().email(),
    studentPhone: zod_1.z.string().optional(),
    courseTitle: zod_1.z.string(),
    currency: zod_1.z.string(),
    amount: zod_1.z.number(),
    discountAmount: zod_1.z.number().optional(),
    promoCode: zod_1.z.string().optional(),
    provider: exports.paymentProviderSchema,
    paymentMethod: exports.paymentMethodSchema.optional(),
    status: exports.orderStatusSchema,
    transactionId: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    paidAt: zod_1.z.string().optional(),
    refundedAt: zod_1.z.string().optional(),
});
exports.createOrderBodySchema = zod_1.z.object({
    studentName: zod_1.z.string().min(1),
    studentEmail: zod_1.z.string().email(),
    studentPhone: zod_1.z.string().optional(),
    courseTitle: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    amount: zod_1.z.number().min(0),
    discountAmount: zod_1.z.number().optional(),
    promoCode: zod_1.z.string().optional(),
    provider: exports.paymentProviderSchema.optional(),
    paymentMethod: exports.paymentMethodSchema.optional(),
    status: exports.orderStatusSchema.optional(),
    transactionId: zod_1.z.string().optional(),
    paidAt: zod_1.z.string().optional(),
    refundedAt: zod_1.z.string().optional(),
});
exports.updateOrderBodySchema = exports.createOrderBodySchema.partial().extend({
    status: exports.orderStatusSchema.optional(),
});
exports.listOrdersResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.orderSchema),
});
exports.orderResponseSchema = zod_1.z.object({
    order: exports.orderSchema,
});
exports.orderNullableResponseSchema = zod_1.z.object({
    order: exports.orderSchema.nullable(),
});
exports.adminDeleteOrderResponseSchema = common_1.apiOkSchema;
//# sourceMappingURL=order.js.map