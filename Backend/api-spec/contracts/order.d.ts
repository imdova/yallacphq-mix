import { z } from "zod";
export declare const orderStatusSchema: z.ZodEnum<{
    paid: "paid";
    pending: "pending";
    failed: "failed";
    refunded: "refunded";
}>;
export declare const paymentProviderSchema: z.ZodEnum<{
    paymob: "paymob";
    stripe: "stripe";
    manual: "manual";
}>;
export declare const paymentMethodSchema: z.ZodEnum<{
    card: "card";
    wallet: "wallet";
    cash: "cash";
}>;
export declare const orderSchema: z.ZodObject<{
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
export type ApiOrder = z.infer<typeof orderSchema>;
export declare const createOrderBodySchema: z.ZodObject<{
    studentName: z.ZodString;
    studentEmail: z.ZodString;
    studentPhone: z.ZodOptional<z.ZodString>;
    courseTitle: z.ZodString;
    currency: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    discountAmount: z.ZodOptional<z.ZodNumber>;
    promoCode: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<{
        paymob: "paymob";
        stripe: "stripe";
        manual: "manual";
    }>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<{
        card: "card";
        wallet: "wallet";
        cash: "cash";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        failed: "failed";
        refunded: "refunded";
    }>>;
    transactionId: z.ZodOptional<z.ZodString>;
    paidAt: z.ZodOptional<z.ZodString>;
    refundedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export declare const updateOrderBodySchema: z.ZodObject<{
    studentName: z.ZodOptional<z.ZodString>;
    studentEmail: z.ZodOptional<z.ZodString>;
    studentPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    courseTitle: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    amount: z.ZodOptional<z.ZodNumber>;
    discountAmount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    promoCode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    provider: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        paymob: "paymob";
        stripe: "stripe";
        manual: "manual";
    }>>>;
    paymentMethod: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        card: "card";
        wallet: "wallet";
        cash: "cash";
    }>>>;
    transactionId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    paidAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    refundedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        paid: "paid";
        pending: "pending";
        failed: "failed";
        refunded: "refunded";
    }>>;
}, z.core.$strip>;
export type UpdateOrderBody = z.infer<typeof updateOrderBodySchema>;
export declare const listOrdersResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListOrdersResponse = z.infer<typeof listOrdersResponseSchema>;
export declare const orderResponseSchema: z.ZodObject<{
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
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export declare const orderNullableResponseSchema: z.ZodObject<{
    order: z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
export type OrderNullableResponse = z.infer<typeof orderNullableResponseSchema>;
export declare const adminDeleteOrderResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
export type AdminDeleteOrderResponse = z.infer<typeof adminDeleteOrderResponseSchema>;
