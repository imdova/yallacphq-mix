import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const baseCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  tag: z.string().min(1, "Tag is required").max(40),
  description: z.string().max(4000).optional(),
  whoCanAttend: z.string().max(3000).optional(),
  whyYalla: z.string().max(3000).optional(),
  includes: z.string().max(4000).optional(),
  instructorName: z.string().min(1, "Instructor name is required").max(120),
  instructorTitle: z.string().min(1, "Instructor title is required").max(160),
  durationHours: z.coerce.number().min(0.5, "Duration must be at least 0.5 hours").max(1000),
  status: z.enum(["draft", "published"]).optional(),
  enableEnrollment: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  socialSharing: z.boolean().optional(),
  priceRegular: z.coerce.number().min(0, "Price must be 0 or more").optional(),
  priceSale: z.coerce.number().min(0, "Sale price must be 0 or more").optional(),
  availability: z.enum(["permanent", "1_month", "3_months", "6_months", "1_year", "custom"]).optional(),
  enablePromoCode: z.boolean().optional(),
  currency: z.string().max(10).optional(),
  discountPercent: z.coerce.number().min(0, "Discount must be 0 or more").max(100, "Discount must be 100 or less").optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  certificationType: z.enum(["CPHQ Prep", "CME Credits", "Micro-Credential"]).optional(),
  rating: z.coerce.number().min(0, "Rating must be 0 or more").max(5, "Rating must be 5 or less").optional(),
  reviewCount: z.coerce.number().int().min(0, "Review count must be 0 or more").optional(),
  enrolledCount: z.coerce.number().int().min(0, "Enrolled must be 0 or more").optional(),
  lessons: z.coerce.number().int().min(0, "Lessons must be 0 or more").optional(),
  imagePlaceholder: z.string().max(240).optional(),
  imageUrl: z
    .string()
    .max(5000)
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const trimmed = v.trim();
        if (!trimmed) return true;
        return trimmed.startsWith("data:image/") || isHttpUrl(trimmed);
      },
      { message: "Image must be a valid URL (http/https) or an uploaded image." }
    ),
  instructorImageUrl: z
    .string()
    .max(5000)
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const trimmed = v.trim();
        if (!trimmed) return true;
        return trimmed.startsWith("data:image/") || isHttpUrl(trimmed);
      },
      { message: "Profile image must be a valid URL or an uploaded image." }
    ),
  videoPreviewUrl: z
    .string()
    .max(500)
    .optional()
    .refine(
      (v) => {
        if (!v) return true;
        const trimmed = v.trim();
        if (!trimmed) return true;
        return isHttpUrl(trimmed);
      },
      { message: "Video preview must be a valid URL (http/https)." }
    ),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().max(500).optional(),
  learningOutcomesText: z.string().max(4000).optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.coerce.number().int().min(0, "Featured order must be 0 or more").optional(),
});

export const createCourseSchema = baseCourseSchema.superRefine((val, ctx) => {
  const regular = val.priceRegular ?? 0;
  const sale = val.priceSale;
  if (sale != null && sale > 0 && sale >= regular && regular > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceSale"],
      message: "Sale price must be lower than regular price.",
    });
  }
});

export const updateCourseSchema = baseCourseSchema.partial().superRefine((val, ctx) => {
  const regular = val.priceRegular;
  const sale = val.priceSale;
  if (regular != null && sale != null && sale > 0 && regular > 0 && sale >= regular) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceSale"],
      message: "Sale price must be lower than regular price.",
    });
  }
});

export const adminCourseCreateSchema = baseCourseSchema.extend({
  description: z.string().min(20, "Description should be at least 20 characters").max(4000),
  whoCanAttend: z.string().min(10, "Please add a short audience description").max(3000),
  whyYalla: z.string().min(10, "Please add a short value proposition").max(3000),
}).superRefine((val, ctx) => {
  const regular = val.priceRegular ?? 0;
  const sale = val.priceSale;
  if (sale != null && sale > 0 && sale >= regular && regular > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["priceSale"],
      message: "Sale price must be lower than regular price.",
    });
  }
});

export type CreateCourseSchema = z.infer<typeof createCourseSchema>;
export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
export type AdminCourseCreateSchema = z.infer<typeof adminCourseCreateSchema>;

