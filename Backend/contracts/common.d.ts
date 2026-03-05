import { z } from "zod";
export declare const apiIssueSchema: z.ZodObject<{
    path: z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    message: z.ZodString;
}, z.core.$strip>;
export declare const apiErrorSchema: z.ZodObject<{
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    issues: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        message: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;
export declare const apiSuccessSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
}, z.core.$strip>;
export declare const apiOkSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
