import { z } from "zod";
export declare const promoDiscountTypeSchema: z.ZodEnum<{
    percentage: "percentage";
    fixed: "fixed";
}>;
export declare const promoCodeSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    discountType: z.ZodEnum<{
        percentage: "percentage";
        fixed: "fixed";
    }>;
    discountValue: z.ZodNumber;
    active: z.ZodBoolean;
    maxUsageEnabled: z.ZodBoolean;
    maxUsage: z.ZodNullable<z.ZodNumber>;
    perCustomerLimitEnabled: z.ZodBoolean;
    perCustomerLimit: z.ZodNullable<z.ZodNumber>;
    restrictToProductEnabled: z.ZodBoolean;
    productId: z.ZodNullable<z.ZodString>;
    usageCount: z.ZodNumber;
}, z.core.$strip>;
export type ApiPromoCode = z.infer<typeof promoCodeSchema>;
export declare const createPromoCodeBodySchema: z.ZodObject<{
    code: z.ZodString;
    discountType: z.ZodEnum<{
        percentage: "percentage";
        fixed: "fixed";
    }>;
    discountValue: z.ZodNumber;
    active: z.ZodOptional<z.ZodBoolean>;
    maxUsageEnabled: z.ZodOptional<z.ZodBoolean>;
    maxUsage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perCustomerLimitEnabled: z.ZodOptional<z.ZodBoolean>;
    perCustomerLimit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    restrictToProductEnabled: z.ZodOptional<z.ZodBoolean>;
    productId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type CreatePromoCodeBody = z.infer<typeof createPromoCodeBodySchema>;
export declare const updatePromoCodeBodySchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodEnum<{
        percentage: "percentage";
        fixed: "fixed";
    }>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    maxUsageEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    maxUsage: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    perCustomerLimitEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    perCustomerLimit: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    restrictToProductEnabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
    productId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export type UpdatePromoCodeBody = z.infer<typeof updatePromoCodeBodySchema>;
export declare const listPromoCodesResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        discountType: z.ZodEnum<{
            percentage: "percentage";
            fixed: "fixed";
        }>;
        discountValue: z.ZodNumber;
        active: z.ZodBoolean;
        maxUsageEnabled: z.ZodBoolean;
        maxUsage: z.ZodNullable<z.ZodNumber>;
        perCustomerLimitEnabled: z.ZodBoolean;
        perCustomerLimit: z.ZodNullable<z.ZodNumber>;
        restrictToProductEnabled: z.ZodBoolean;
        productId: z.ZodNullable<z.ZodString>;
        usageCount: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListPromoCodesResponse = z.infer<typeof listPromoCodesResponseSchema>;
export declare const promoCodeResponseSchema: z.ZodObject<{
    promo: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        discountType: z.ZodEnum<{
            percentage: "percentage";
            fixed: "fixed";
        }>;
        discountValue: z.ZodNumber;
        active: z.ZodBoolean;
        maxUsageEnabled: z.ZodBoolean;
        maxUsage: z.ZodNullable<z.ZodNumber>;
        perCustomerLimitEnabled: z.ZodBoolean;
        perCustomerLimit: z.ZodNullable<z.ZodNumber>;
        restrictToProductEnabled: z.ZodBoolean;
        productId: z.ZodNullable<z.ZodString>;
        usageCount: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export type PromoCodeResponse = z.infer<typeof promoCodeResponseSchema>;
export declare const promoCodeNullableResponseSchema: z.ZodObject<{
    promo: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        discountType: z.ZodEnum<{
            percentage: "percentage";
            fixed: "fixed";
        }>;
        discountValue: z.ZodNumber;
        active: z.ZodBoolean;
        maxUsageEnabled: z.ZodBoolean;
        maxUsage: z.ZodNullable<z.ZodNumber>;
        perCustomerLimitEnabled: z.ZodBoolean;
        perCustomerLimit: z.ZodNullable<z.ZodNumber>;
        restrictToProductEnabled: z.ZodBoolean;
        productId: z.ZodNullable<z.ZodString>;
        usageCount: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type PromoCodeNullableResponse = z.infer<typeof promoCodeNullableResponseSchema>;
export declare const adminDeletePromoCodeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type AdminDeletePromoCodeResponse = z.infer<typeof adminDeletePromoCodeResponseSchema>;
export declare const validatePromoCodeBodySchema: z.ZodObject<{
    courseId: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export type ValidatePromoCodeBody = z.infer<typeof validatePromoCodeBodySchema>;
export declare const validatePromoCodeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    promo: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        discountType: z.ZodEnum<{
            percentage: "percentage";
            fixed: "fixed";
        }>;
        discountValue: z.ZodNumber;
        active: z.ZodBoolean;
        maxUsageEnabled: z.ZodBoolean;
        maxUsage: z.ZodNullable<z.ZodNumber>;
        perCustomerLimitEnabled: z.ZodBoolean;
        perCustomerLimit: z.ZodNullable<z.ZodNumber>;
        restrictToProductEnabled: z.ZodBoolean;
        productId: z.ZodNullable<z.ZodString>;
        usageCount: z.ZodNumber;
    }, z.core.$strip>;
    discountAmount: z.ZodNumber;
    discountedTotal: z.ZodNumber;
}, z.core.$strip>;
export type ValidatePromoCodeResponse = z.infer<typeof validatePromoCodeResponseSchema>;
