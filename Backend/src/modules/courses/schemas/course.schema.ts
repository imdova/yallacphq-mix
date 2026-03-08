import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ _id: false })
export class CourseReviewMediaItem {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true, enum: ['image', 'video', 'youtube'] })
  kind!: 'image' | 'video' | 'youtube';

  @Prop({ required: true })
  src!: string;

  @Prop()
  caption?: string;

  @Prop()
  poster?: string;
}

export const CourseReviewMediaItemSchema =
  SchemaFactory.createForClass(CourseReviewMediaItem);

@Schema({ _id: false })
export class CurriculumItem {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true, enum: ['lecture', 'quiz'] })
  type!: 'lecture' | 'quiz';

  @Prop({ required: true })
  title!: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  materialUrl?: string;

  @Prop()
  materialFileName?: string;

  @Prop()
  freeLecture?: boolean;
}

export const CurriculumItemSchema = SchemaFactory.createForClass(CurriculumItem);

@Schema({ _id: false })
export class CurriculumSection {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: [CurriculumItemSchema], default: undefined })
  items?: CurriculumItem[];
}

export const CurriculumSectionSchema =
  SchemaFactory.createForClass(CurriculumSection);

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  tag!: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop({ default: 0 })
  reviewCount!: number;

  @Prop()
  description?: string;

  @Prop()
  whoCanAttend?: string;

  @Prop()
  whyYalla?: string;

  @Prop()
  includes?: string;

  @Prop({ required: true })
  instructorName!: string;

  @Prop({ required: true })
  instructorTitle!: string;

  @Prop({ required: true, min: 0 })
  durationHours!: number;

  @Prop()
  enrolledCount?: number;

  @Prop()
  lessons?: number;

  @Prop({ enum: ['draft', 'published'], default: 'published' })
  status?: 'draft' | 'published';

  @Prop()
  enableEnrollment?: boolean;

  @Prop()
  requireApproval?: boolean;

  @Prop()
  socialSharing?: boolean;

  @Prop()
  priceRegular?: number;

  @Prop()
  priceSale?: number;

  @Prop({
    enum: ['permanent', '1_month', '3_months', '6_months', '1_year', 'custom'],
  })
  availability?:
    | 'permanent'
    | '1_month'
    | '3_months'
    | '6_months'
    | '1_year'
    | 'custom';

  @Prop()
  enablePromoCode?: boolean;

  @Prop()
  currency?: string;

  @Prop()
  discountPercent?: number;

  @Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  @Prop({ enum: ['CPHQ Prep', 'CME Credits', 'Micro-Credential'] })
  certificationType?: 'CPHQ Prep' | 'CME Credits' | 'Micro-Credential';

  @Prop()
  imagePlaceholder?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  instructorImageUrl?: string;

  @Prop()
  videoPreviewUrl?: string;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop()
  seoKeywords?: string;

  @Prop({ type: [String], default: undefined })
  learningOutcomes?: string[];

  @Prop({ type: [CurriculumSectionSchema], default: undefined })
  curriculumSections?: CurriculumSection[];

  @Prop({ type: [CourseReviewMediaItemSchema], default: undefined })
  reviewMedia?: CourseReviewMediaItem[];

  @Prop({ default: false })
  featured?: boolean;

  @Prop({ min: 0 })
  featuredOrder?: number;

  @Prop({ type: [String], default: undefined })
  relatedCourseIds?: string[];

  @Prop({ type: Types.ObjectId, required: false })
  createdByUserId?: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
