import { z } from "zod";
export declare const leadCreateBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    specialty: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type LeadCreateBody = z.infer<typeof leadCreateBodySchema>;
export declare const legacyLeadCreateBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    specialty: z.ZodString;
}, z.core.$strip>;
export type LegacyLeadCreateBody = z.infer<typeof legacyLeadCreateBodySchema>;
export declare const leadSubmitResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    errors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type LeadSubmitResponse = z.infer<typeof leadSubmitResponseSchema>;
export declare const registerCphqBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    specialty: z.ZodString;
}, z.core.$strip>;
export type RegisterCphqBody = z.infer<typeof registerCphqBodySchema>;
export declare const registerCphqResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    errors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type RegisterCphqResponse = z.infer<typeof registerCphqResponseSchema>;
export declare const webinarRegisterBodySchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    specialty: z.ZodString;
}, z.core.$strip>;
export type WebinarRegisterBody = z.infer<typeof webinarRegisterBodySchema>;
export declare const webinarRegisterResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    errors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type WebinarRegisterResponse = z.infer<typeof webinarRegisterResponseSchema>;
