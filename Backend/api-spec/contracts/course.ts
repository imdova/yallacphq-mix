import { z } from "zod";
import { apiOkSchema } from "./common";

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  tag: z.string(),
  rating: z.number(),
  reviewCount: z.number(),

  description: z.string().optional(),
  whoCanAttend: z.string().optional(),
  whyYalla: z.string().optional(),
  includes: z.string().optional(),

  instructorName: z.string(),
  instructorTitle: z.string(),
  durationHours: z.number(),

  enrolledCount: z.number().optional(),
  lessons: z.number().optional(),

  status: z.enum(["draft", "published"]).optional(),
  enableEnrollment: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  socialSharing: z.boolean().optional(),

  priceRegular: z.number().optional(),
  priceSale: z.number().optional(),
  availability: z
    .enum(["permanent", "1_month", "3_months", "6_months", "1_year", "custom"])
    .optional(),
  enablePromoCode: z.boolean().optional(),
  currency: z.string().optional(),
  discountPercent: z.number().optional(),

  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  certificationType: z.enum(["CPHQ Prep", "CME Credits", "Micro-Credential"]).optional(),

  imagePlaceholder: z.string().optional(),
  imageUrl: z.string().optional(),
  instructorImageUrl: z.string().optional(),
  videoPreviewUrl: z.string().optional(),

  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export type ApiCourse = z.infer<typeof courseSchema>;

export const createCourseBodySchema = z.object({
  title: z.string().min(1),
  tag: z.string().min(1),
  description: z.string().optional(),
  whoCanAttend: z.string().optional(),
  whyYalla: z.string().optional(),
  includes: z.string().optional(),
  instructorName: z.string().min(1),
  instructorTitle: z.string().min(1),
  durationHours: z.number().min(0),
  status: z.enum(["draft", "published"]).optional(),
  enableEnrollment: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  socialSharing: z.boolean().optional(),
  priceRegular: z.number().optional(),
  priceSale: z.number().optional(),
  availability: z
    .enum(["permanent", "1_month", "3_months", "6_months", "1_year", "custom"])
    .optional(),
  enablePromoCode: z.boolean().optional(),
  currency: z.string().optional(),
  discountPercent: z.number().optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  certificationType: z.enum(["CPHQ Prep", "CME Credits", "Micro-Credential"]).optional(),
  enrolledCount: z.number().optional(),
  lessons: z.number().optional(),
  imagePlaceholder: z.string().optional(),
  imageUrl: z.string().optional(),
  instructorImageUrl: z.string().optional(),
  videoPreviewUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export type CreateCourseBody = z.infer<typeof createCourseBodySchema>;

export const updateCourseBodySchema = createCourseBodySchema.partial();

export type UpdateCourseBody = z.infer<typeof updateCourseBodySchema>;

export const listCoursesResponseSchema = z.object({
  items: z.array(courseSchema),
});

export type ListCoursesResponse = z.infer<typeof listCoursesResponseSchema>;

export const courseResponseSchema = z.object({
  course: courseSchema,
});

export type CourseResponse = z.infer<typeof courseResponseSchema>;

export const courseNullableResponseSchema = z.object({
  course: courseSchema.nullable(),
});

export type CourseNullableResponse = z.infer<typeof courseNullableResponseSchema>;

export const adminCourseResponseSchema = courseResponseSchema;
export type AdminCourseResponse = z.infer<typeof adminCourseResponseSchema>;

export const adminCourseNullableResponseSchema = courseNullableResponseSchema;
export type AdminCourseNullableResponse = z.infer<typeof adminCourseNullableResponseSchema>;

export const adminDeleteCourseResponseSchema = apiOkSchema;
export type AdminDeleteCourseResponse = z.infer<typeof adminDeleteCourseResponseSchema>;

export const publicCoursesResponseSchema = z.object({
  items: z.array(courseSchema),
});

export type PublicCoursesResponse = z.infer<typeof publicCoursesResponseSchema>;

export const publicCourseResponseSchema = z.object({
  course: courseSchema,
});

export type PublicCourseResponse = z.infer<typeof publicCourseResponseSchema>;

export const enrollCourseBodySchema = z.object({
  userId: z.string().optional(),
});

export type EnrollCourseBody = z.infer<typeof enrollCourseBodySchema>;

export const enrollCourseResponseSchema = z.object({
  ok: z.literal(true),
  enrolledCount: z.number().optional(),
});

export type EnrollCourseResponse = z.infer<typeof enrollCourseResponseSchema>;

