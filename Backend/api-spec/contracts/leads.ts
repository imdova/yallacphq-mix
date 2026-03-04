import { z } from "zod";

export const leadCreateBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  specialty: z.string().optional(),
});

export type LeadCreateBody = z.infer<typeof leadCreateBodySchema>;

/**
 * Legacy endpoints (`/api/register-cphq`, `/api/webinar-register`) historically required specialty.
 * Keep a stricter schema for those routes while allowing `/api/leads/*` to keep `specialty` optional.
 */
export const legacyLeadCreateBodySchema = leadCreateBodySchema.extend({
  specialty: z.string().min(1),
});

export type LegacyLeadCreateBody = z.infer<typeof legacyLeadCreateBodySchema>;

export const leadSubmitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

export type LeadSubmitResponse = z.infer<typeof leadSubmitResponseSchema>;

// Aliases to make endpoint coverage explicit in audits.
export const registerCphqBodySchema = legacyLeadCreateBodySchema;
export type RegisterCphqBody = z.infer<typeof registerCphqBodySchema>;
export const registerCphqResponseSchema = leadSubmitResponseSchema;
export type RegisterCphqResponse = z.infer<typeof registerCphqResponseSchema>;

export const webinarRegisterBodySchema = legacyLeadCreateBodySchema;
export type WebinarRegisterBody = z.infer<typeof webinarRegisterBodySchema>;
export const webinarRegisterResponseSchema = leadSubmitResponseSchema;
export type WebinarRegisterResponse = z.infer<typeof webinarRegisterResponseSchema>;

