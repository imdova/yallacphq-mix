import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

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

  @Prop({ enum: ['draft', 'published'], default: 'draft' })
  status?: 'draft' | 'published';

  @Prop({ enum: ['public', 'private'], default: 'private' })
  visibility?: 'public' | 'private';

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

  @Prop({ type: Types.ObjectId, required: false })
  createdByUserId?: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
