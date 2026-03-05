"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollCourseResponseSchema = exports.enrollCourseBodySchema = exports.publicCourseResponseSchema = exports.publicCoursesResponseSchema = exports.adminDeleteCourseResponseSchema = exports.adminCourseNullableResponseSchema = exports.adminCourseResponseSchema = exports.courseNullableResponseSchema = exports.courseResponseSchema = exports.listCoursesResponseSchema = exports.updateCourseBodySchema = exports.createCourseBodySchema = exports.courseSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.courseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    tag: zod_1.z.string(),
    rating: zod_1.z.number(),
    reviewCount: zod_1.z.number(),
    description: zod_1.z.string().optional(),
    whoCanAttend: zod_1.z.string().optional(),
    whyYalla: zod_1.z.string().optional(),
    includes: zod_1.z.string().optional(),
    instructorName: zod_1.z.string(),
    instructorTitle: zod_1.z.string(),
    durationHours: zod_1.z.number(),
    enrolledCount: zod_1.z.number().optional(),
    lessons: zod_1.z.number().optional(),
    status: zod_1.z.enum(["draft", "published"]).optional(),
    visibility: zod_1.z.enum(["public", "private"]).optional(),
    enableEnrollment: zod_1.z.boolean().optional(),
    requireApproval: zod_1.z.boolean().optional(),
    socialSharing: zod_1.z.boolean().optional(),
    priceRegular: zod_1.z.number().optional(),
    priceSale: zod_1.z.number().optional(),
    availability: zod_1.z
        .enum(["permanent", "1_month", "3_months", "6_months", "1_year", "custom"])
        .optional(),
    enablePromoCode: zod_1.z.boolean().optional(),
    currency: zod_1.z.string().optional(),
    discountPercent: zod_1.z.number().optional(),
    level: zod_1.z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    certificationType: zod_1.z.enum(["CPHQ Prep", "CME Credits", "Micro-Credential"]).optional(),
    imagePlaceholder: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    instructorImageUrl: zod_1.z.string().optional(),
    videoPreviewUrl: zod_1.z.string().optional(),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    seoKeywords: zod_1.z.string().optional(),
});
exports.createCourseBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    tag: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    whoCanAttend: zod_1.z.string().optional(),
    whyYalla: zod_1.z.string().optional(),
    includes: zod_1.z.string().optional(),
    instructorName: zod_1.z.string().min(1),
    instructorTitle: zod_1.z.string().min(1),
    durationHours: zod_1.z.number().min(0),
    status: zod_1.z.enum(["draft", "published"]).optional(),
    visibility: zod_1.z.enum(["public", "private"]).optional(),
    enableEnrollment: zod_1.z.boolean().optional(),
    requireApproval: zod_1.z.boolean().optional(),
    socialSharing: zod_1.z.boolean().optional(),
    priceRegular: zod_1.z.number().optional(),
    priceSale: zod_1.z.number().optional(),
    availability: zod_1.z
        .enum(["permanent", "1_month", "3_months", "6_months", "1_year", "custom"])
        .optional(),
    enablePromoCode: zod_1.z.boolean().optional(),
    currency: zod_1.z.string().optional(),
    discountPercent: zod_1.z.number().optional(),
    level: zod_1.z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    certificationType: zod_1.z.enum(["CPHQ Prep", "CME Credits", "Micro-Credential"]).optional(),
    enrolledCount: zod_1.z.number().optional(),
    lessons: zod_1.z.number().optional(),
    imagePlaceholder: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    instructorImageUrl: zod_1.z.string().optional(),
    videoPreviewUrl: zod_1.z.string().optional(),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    seoKeywords: zod_1.z.string().optional(),
});
exports.updateCourseBodySchema = exports.createCourseBodySchema.partial();
exports.listCoursesResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.courseSchema),
});
exports.courseResponseSchema = zod_1.z.object({
    course: exports.courseSchema,
});
exports.courseNullableResponseSchema = zod_1.z.object({
    course: exports.courseSchema.nullable(),
});
exports.adminCourseResponseSchema = exports.courseResponseSchema;
exports.adminCourseNullableResponseSchema = exports.courseNullableResponseSchema;
exports.adminDeleteCourseResponseSchema = common_1.apiOkSchema;
exports.publicCoursesResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.courseSchema),
});
exports.publicCourseResponseSchema = zod_1.z.object({
    course: exports.courseSchema,
});
exports.enrollCourseBodySchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
});
exports.enrollCourseResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    enrolledCount: zod_1.z.number().optional(),
});
//# sourceMappingURL=course.js.map