import { z } from "zod";
import { apiOkSchema } from "./common";
import { userSchema } from "./user";

export const courseReviewMediaKindSchema = z.enum(["image", "video", "youtube"]);
export const courseReviewMediaItemSchema = z.object({
  id: z.string().min(1),
  kind: courseReviewMediaKindSchema,
  src: z.string().min(1),
  caption: z.string().optional(),
  poster: z.string().optional(),
});

export const curriculumLectureSchema = z.object({
  id: z.string().min(1),
  type: z.literal("lecture"),
  title: z.string().min(1),
  videoUrl: z.string().optional(),
  materialUrl: z.string().optional(),
  materialFileName: z.string().optional(),
  freeLecture: z.boolean().optional(),
});

export const curriculumQuizSchema = z.object({
  id: z.string().min(1),
  type: z.literal("quiz"),
  title: z.string().min(1),
});

export const curriculumItemSchema = z.discriminatedUnion("type", [
  curriculumLectureSchema,
  curriculumQuizSchema,
]);

export const curriculumSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(curriculumItemSchema).optional(),
});

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
  learningOutcomes: z.array(z.string()).optional(),
  curriculumSections: z.array(curriculumSectionSchema).optional(),
  reviewMedia: z.array(courseReviewMediaItemSchema).optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).optional(),
  relatedCourseIds: z.array(z.string()).optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  enrolledCount: z.number().optional(),
  lessons: z.number().optional(),
  imagePlaceholder: z.string().optional(),
  imageUrl: z.string().optional(),
  instructorImageUrl: z.string().optional(),
  videoPreviewUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  learningOutcomes: z.array(z.string().min(1)).optional(),
  curriculumSections: z.array(curriculumSectionSchema).optional(),
  reviewMedia: z.array(courseReviewMediaItemSchema).optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).optional(),
  relatedCourseIds: z.array(z.string().min(1)).optional(),
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

/** Admin: enroll a user in a course. Body: { userId } */
export const adminEnrollUserBodySchema = z.object({
  userId: z.string().min(1),
});

export type AdminEnrollUserBody = z.infer<typeof adminEnrollUserBodySchema>;

export const adminEnrollUserResponseSchema = z.object({
  ok: z.literal(true),
  user: userSchema.optional(),
});

export type AdminEnrollUserResponse = z.infer<typeof adminEnrollUserResponseSchema>;

