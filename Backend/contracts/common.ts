import { z } from "zod";

export const apiIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

/**
 * Standard error payload returned by API routes.
 * Keep this shape stable so UI can reliably render errors.
 */
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  issues: z.array(apiIssueSchema).optional(),
});

export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;

export const apiSuccessSchema = z.object({
  success: z.literal(true),
});

export const apiOkSchema = z.object({
  ok: z.literal(true),
});

