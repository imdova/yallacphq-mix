"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePromoCodeResponseSchema = exports.validatePromoCodeBodySchema = exports.adminDeletePromoCodeResponseSchema = exports.promoCodeNullableResponseSchema = exports.promoCodeResponseSchema = exports.listPromoCodesResponseSchema = exports.updatePromoCodeBodySchema = exports.createPromoCodeBodySchema = exports.promoCodeSchema = exports.promoDiscountTypeSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.promoDiscountTypeSchema = zod_1.z.enum(["percentage", "fixed"]);
exports.promoCodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    code: zod_1.z.string(),
    discountType: exports.promoDiscountTypeSchema,
    discountValue: zod_1.z.number(),
    active: zod_1.z.boolean(),
    maxUsageEnabled: zod_1.z.boolean(),
    maxUsage: zod_1.z.number().nullable(),
    perCustomerLimitEnabled: zod_1.z.boolean(),
    perCustomerLimit: zod_1.z.number().nullable(),
    restrictToProductEnabled: zod_1.z.boolean(),
    productId: zod_1.z.string().nullable(),
    usageCount: zod_1.z.number(),
});
exports.createPromoCodeBodySchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    discountType: exports.promoDiscountTypeSchema,
    discountValue: zod_1.z.number().min(0),
    active: zod_1.z.boolean().optional(),
    maxUsageEnabled: zod_1.z.boolean().optional(),
    maxUsage: zod_1.z.number().nullable().optional(),
    perCustomerLimitEnabled: zod_1.z.boolean().optional(),
    perCustomerLimit: zod_1.z.number().nullable().optional(),
    restrictToProductEnabled: zod_1.z.boolean().optional(),
    productId: zod_1.z.string().nullable().optional(),
});
exports.updatePromoCodeBodySchema = exports.createPromoCodeBodySchema.partial();
exports.listPromoCodesResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.promoCodeSchema),
});
exports.promoCodeResponseSchema = zod_1.z.object({
    promo: exports.promoCodeSchema,
});
exports.promoCodeNullableResponseSchema = zod_1.z.object({
    promo: exports.promoCodeSchema.nullable(),
});
exports.adminDeletePromoCodeResponseSchema = common_1.apiOkSchema;
exports.validatePromoCodeBodySchema = zod_1.z.object({
    courseId: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
});
exports.validatePromoCodeResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    promo: exports.promoCodeSchema,
    discountAmount: zod_1.z.number().min(0),
    discountedTotal: zod_1.z.number().min(0),
});
//# sourceMappingURL=promo.js.map