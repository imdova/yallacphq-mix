import { z } from "zod";
import { userSchema } from "./user";
import { courseSchema } from "./course";
import { orderSchema } from "./order";

export const adminSearchResponseSchema = z.object({
  students: z.array(userSchema),
  courses: z.array(courseSchema),
  orders: z.array(orderSchema),
});

export type AdminSearchResponse = z.infer<typeof adminSearchResponseSchema>;
