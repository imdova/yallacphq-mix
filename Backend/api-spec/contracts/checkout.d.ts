import { z } from "zod";
export declare const checkoutPaymentMethodSchema: z.ZodEnum<{
    card: "card";
    paypal: "paypal";
    bank: "bank";
}>;
export declare const createPaymentSessionBodySchema: z.ZodObject<{
    method: z.ZodEnum<{
        card: "card";
        paypal: "paypal";
        bank: "bank";
    }>;
    courseTitle: z.ZodString;
    currency: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    discountAmount: z.ZodOptional<z.ZodNumber>;
    promoCode: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePaymentSessionBody = z.infer<typeof createPaymentSessionBodySchema>;
export declare const createPaymentSessionResponseSchema: z.ZodObject<{
    sessionId: z.ZodString;
    provider: z.ZodEnum<{
        paymob: "paymob";
        stripe: "stripe";
        manual: "manual";
    }>;
    order: z.ZodObject<{
        id: z.ZodString;
        studentName: z.ZodString;
        studentEmail: z.ZodString;
        studentPhone: z.ZodOptional<z.ZodString>;
        courseTitle: z.ZodString;
        currency: z.ZodString;
        amount: z.ZodNumber;
        discountAmount: z.ZodOptional<z.ZodNumber>;
        promoCode: z.ZodOptional<z.ZodString>;
        provider: z.ZodEnum<{
            paymob: "paymob";
            stripe: "stripe";
            manual: "manual";
        }>;
        paymentMethod: z.ZodOptional<z.ZodEnum<{
            card: "card";
            wallet: "wallet";
            cash: "cash";
        }>>;
        status: z.ZodEnum<{
            paid: "paid";
            pending: "pending";
            failed: "failed";
            refunded: "refunded";
        }>;
        transactionId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        paidAt: z.ZodOptional<z.ZodString>;
        refundedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CreatePaymentSessionResponse = z.infer<typeof createPaymentSessionResponseSchema>;
export declare const confirmPaymentBodySchema: z.ZodObject<{
    orderId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        failed: "failed";
        refunded: "refunded";
    }>>;
    transactionId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ConfirmPaymentBody = z.infer<typeof confirmPaymentBodySchema>;
export declare const confirmPaymentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    order: z.ZodObject<{
        id: z.ZodString;
        studentName: z.ZodString;
        studentEmail: z.ZodString;
        studentPhone: z.ZodOptional<z.ZodString>;
        courseTitle: z.ZodString;
        currency: z.ZodString;
        amount: z.ZodNumber;
        discountAmount: z.ZodOptional<z.ZodNumber>;
        promoCode: z.ZodOptional<z.ZodString>;
        provider: z.ZodEnum<{
            paymob: "paymob";
            stripe: "stripe";
            manual: "manual";
        }>;
        paymentMethod: z.ZodOptional<z.ZodEnum<{
            card: "card";
            wallet: "wallet";
            cash: "cash";
        }>>;
        status: z.ZodEnum<{
            paid: "paid";
            pending: "pending";
            failed: "failed";
            refunded: "refunded";
        }>;
        transactionId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        paidAt: z.ZodOptional<z.ZodString>;
        refundedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ConfirmPaymentResponse = z.infer<typeof confirmPaymentResponseSchema>;
