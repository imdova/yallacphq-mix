import { z } from "zod";

export const cartResponseSchema = z.object({
  courseIds: z.array(z.string()),
});

export type CartResponse = z.infer<typeof cartResponseSchema>;

export const addToCartBodySchema = z.object({
  courseId: z.coerce.string().min(1, "courseId is required"),
});

export type AddToCartBody = z.infer<typeof addToCartBodySchema>;
