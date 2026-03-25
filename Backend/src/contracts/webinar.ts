import { z } from 'zod';

const webinarSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens only');

export const webinarStatusSchema = z.enum(['draft', 'published']);
export type WebinarStatus = z.infer<typeof webinarStatusSchema>;

export const webinarLearnPointSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});
export type WebinarLearnPoint = z.infer<typeof webinarLearnPointSchema>;

export const webinarStatSchema = z.object({
  id: z.string().min(1),
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});
export type WebinarStat = z.infer<typeof webinarStatSchema>;

export const webinarEditableFieldsSchema = z.object({
  title: z.string().trim().min(1),
  slug: webinarSlugSchema,
  excerpt: z.string().trim(),
  description: z.string().trim(),
  status: webinarStatusSchema,
  startsAt: z.string().datetime(),
  timezoneLabel: z.string().trim().min(1),
  speakerName: z.string().trim().min(1),
  speakerTitle: z.string().trim(),
  coverImageUrl: z.string().trim(),
  videoUrl: z.string().trim(),
  registrationEnabled: z.boolean(),
  seatsLeft: z.number().int().min(0).nullable(),
  isFeatured: z.boolean(),
  learnPoints: z.array(webinarLearnPointSchema),
  trustedBy: z.array(z.string().trim().min(1)),
  stats: z.array(webinarStatSchema),
});

export const createWebinarBodySchema = webinarEditableFieldsSchema;
export type CreateWebinarBody = z.infer<typeof createWebinarBodySchema>;

export const updateWebinarBodySchema = webinarEditableFieldsSchema.partial();
export type UpdateWebinarBody = z.infer<typeof updateWebinarBodySchema>;

export const webinarSchema = webinarEditableFieldsSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  lastUpdated: z.string().datetime(),
});
export type ApiWebinar = z.infer<typeof webinarSchema>;

export const listWebinarsResponseSchema = z.object({
  items: z.array(webinarSchema),
});
export type ListWebinarsResponse = z.infer<typeof listWebinarsResponseSchema>;

export const webinarResponseSchema = z.object({
  webinar: webinarSchema,
});
export type WebinarResponse = z.infer<typeof webinarResponseSchema>;

export const webinarNullableResponseSchema = z.object({
  webinar: webinarSchema.nullable(),
});
export type WebinarNullableResponse = z.infer<typeof webinarNullableResponseSchema>;

export const adminDeleteWebinarResponseSchema = z.object({
  ok: z.literal(true),
});
export type AdminDeleteWebinarResponse = z.infer<
  typeof adminDeleteWebinarResponseSchema
>;
