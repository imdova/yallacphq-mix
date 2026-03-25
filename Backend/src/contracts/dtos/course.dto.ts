import { ApiProperty } from '@nestjs/swagger';

export enum CourseStatusDto {
  draft = 'draft',
  published = 'published',
}

export class CourseReviewMediaItemDto {
  @ApiProperty({ example: 'review-1' })
  id!: string;

  @ApiProperty({ enum: ['image', 'video', 'youtube'], example: 'youtube' })
  kind!: string;

  @ApiProperty({ example: 'https://www.youtube.com/watch?v=123' })
  src!: string;

  @ApiProperty({ required: false, example: 'Student video feedback' })
  caption?: string;

  @ApiProperty({ required: false, example: 'https://example.com/poster.jpg' })
  poster?: string;
}

export class CurriculumItemDto {
  @ApiProperty({ example: 'item-1' })
  id!: string;

  @ApiProperty({ enum: ['lecture', 'quiz'], example: 'lecture' })
  type!: string;

  @ApiProperty({ example: 'Introduction to CPHQ' })
  title!: string;

  @ApiProperty({ required: false, example: '69c1257797fa8fc1f2cd43ff' })
  quizId?: string;

  @ApiProperty({ required: false, example: 'https://www.youtube.com/watch?v=123' })
  videoUrl?: string;

  @ApiProperty({ required: false, example: 'https://example.com/handout.pdf' })
  materialUrl?: string;

  @ApiProperty({ required: false, example: 'Handout.pdf' })
  materialFileName?: string;

  @ApiProperty({ required: false, example: true })
  freeLecture?: boolean;
}

export class CurriculumSectionDto {
  @ApiProperty({ example: 'section-1' })
  id!: string;

  @ApiProperty({ example: 'Module 1: Foundations' })
  title!: string;

  @ApiProperty({ required: false, example: 'Core concepts for exam readiness.' })
  description?: string;

  @ApiProperty({ type: [CurriculumItemDto] })
  items!: CurriculumItemDto[];
}

export class ApiCourseDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10' })
  id!: string;

  @ApiProperty({ example: 'CPHQ Exam Prep 2026' })
  title!: string;

  @ApiProperty({ example: 'CPHQ' })
  tag!: string;

  @ApiProperty({ example: 4.8, minimum: 0 })
  rating!: number;

  @ApiProperty({ example: 120, minimum: 0 })
  reviewCount!: number;

  @ApiProperty({ required: false, example: 'A complete course to prepare...' })
  description?: string;

  @ApiProperty({ required: false, example: 'Healthcare quality professionals' })
  whoCanAttend?: string;

  @ApiProperty({ required: false, example: 'Expert instructors...' })
  whyYalla?: string;

  @ApiProperty({ required: false, example: 'PDFs, videos, mock exams' })
  includes?: string;

  @ApiProperty({ example: 'Dr. A. Instructor' })
  instructorName!: string;

  @ApiProperty({ example: 'Quality Director' })
  instructorTitle!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  durationHours!: number;

  @ApiProperty({ required: false, example: 430 })
  enrolledCount?: number;

  @ApiProperty({ required: false, example: 24 })
  lessons?: number;

  @ApiProperty({
    required: false,
    enum: CourseStatusDto,
    example: CourseStatusDto.draft,
  })
  status?: CourseStatusDto;

  @ApiProperty({ required: false, example: true })
  enableEnrollment?: boolean;

  @ApiProperty({ required: false, example: false })
  requireApproval?: boolean;

  @ApiProperty({ required: false, example: true })
  socialSharing?: boolean;

  @ApiProperty({ required: false, example: 399 })
  priceRegular?: number;

  @ApiProperty({ required: false, example: 299 })
  priceSale?: number;

  @ApiProperty({
    required: false,
    enum: ['permanent', '1_month', '3_months', '6_months', '1_year', 'custom'],
    example: 'permanent',
  })
  availability?: string;

  @ApiProperty({ required: false, example: false })
  enablePromoCode?: boolean;

  @ApiProperty({ required: false, example: 'usd' })
  currency?: string;

  @ApiProperty({ required: false, example: 25 })
  discountPercent?: number;

  @ApiProperty({
    required: false,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    example: 'Intermediate',
  })
  level?: string;

  @ApiProperty({
    required: false,
    enum: ['CPHQ Prep', 'CME Credits', 'Micro-Credential'],
    example: 'CPHQ Prep',
  })
  certificationType?: string;

  @ApiProperty({ required: false, example: 'Course cover placeholder' })
  imagePlaceholder?: string;

  @ApiProperty({ required: false, example: 'https://example.com/course.jpg' })
  imageUrl?: string;

  @ApiProperty({ required: false, example: 'https://example.com/instructor.jpg' })
  instructorImageUrl?: string;

  @ApiProperty({ required: false, example: 'https://www.youtube.com/watch?v=123' })
  videoPreviewUrl?: string;

  @ApiProperty({ required: false, example: 'CPHQ Program | Yalla CPHQ' })
  seoTitle?: string;

  @ApiProperty({ required: false, example: 'Prepare for the CPHQ exam with expert-led training.' })
  seoDescription?: string;

  @ApiProperty({ required: false, example: 'cphq, healthcare quality, patient safety' })
  seoKeywords?: string;

  @ApiProperty({ required: false, type: [String], example: ['Master exam domains', 'Apply quality tools'] })
  learningOutcomes?: string[];

  @ApiProperty({ required: false, type: [CurriculumSectionDto] })
  curriculumSections?: CurriculumSectionDto[];

  @ApiProperty({ required: false, type: [CourseReviewMediaItemDto] })
  reviewMedia?: CourseReviewMediaItemDto[];

  @ApiProperty({ required: false, example: true })
  featured?: boolean;

  @ApiProperty({ required: false, example: 1 })
  featuredOrder?: number;

  @ApiProperty({ required: false, type: [String], example: ['65f3c77b0f6d1b5a3d1d9a11'] })
  relatedCourseIds?: string[];

  @ApiProperty({ required: false, example: '2026-03-05T10:00:00.000Z' })
  createdAt?: string;

  @ApiProperty({ required: false, example: '2026-03-05T10:00:00.000Z' })
  updatedAt?: string;
}

export class CreateCourseBodyDto {
  @ApiProperty({ example: 'CPHQ Exam Prep 2026', minLength: 1, description: 'Course title' })
  title!: string;

  @ApiProperty({ example: 'CPHQ', minLength: 1, description: 'Short tag or category code' })
  tag!: string;

  @ApiProperty({ example: 'Dr. A. Instructor', minLength: 1, description: 'Instructor full name' })
  instructorName!: string;

  @ApiProperty({ example: 'Quality Director', minLength: 1, description: 'Instructor title or credential' })
  instructorTitle!: string;

  @ApiProperty({ example: 12, minimum: 0, description: 'Total duration in hours' })
  durationHours!: number;

  @ApiProperty({ required: false, enum: CourseStatusDto, example: 'draft', description: 'draft or published' })
  status?: CourseStatusDto;

  @ApiProperty({ required: false, example: 'A complete course to prepare for the CPHQ exam...', description: 'Course description' })
  description?: string;

  @ApiProperty({ required: false, example: 'Healthcare quality professionals', description: 'Who can attend' })
  whoCanAttend?: string;

  @ApiProperty({ required: false, example: 'Expert instructors, practice exams', description: 'Why choose Yalla' })
  whyYalla?: string;

  @ApiProperty({ required: false, example: 'PDFs, videos, mock exams', description: 'What is included' })
  includes?: string;

  @ApiProperty({ required: false, example: true, description: 'Allow enrollment' })
  enableEnrollment?: boolean;

  @ApiProperty({ required: false, example: false, description: 'Require approval to enroll' })
  requireApproval?: boolean;

  @ApiProperty({ required: false, example: true, description: 'Allow social sharing' })
  socialSharing?: boolean;

  @ApiProperty({ required: false, example: 399, minimum: 0, description: 'Regular price' })
  priceRegular?: number;

  @ApiProperty({ required: false, example: 299, minimum: 0, description: 'Sale price' })
  priceSale?: number;

  @ApiProperty({
    required: false,
    enum: ['permanent', '1_month', '3_months', '6_months', '1_year', 'custom'],
    example: 'permanent',
    description: 'Access availability window',
  })
  availability?: string;

  @ApiProperty({ required: false, example: false, description: 'Enable promo codes' })
  enablePromoCode?: boolean;

  @ApiProperty({ required: false, example: 'usd', description: 'Currency code' })
  currency?: string;

  @ApiProperty({ required: false, example: 25, minimum: 0, description: 'Discount percentage' })
  discountPercent?: number;

  @ApiProperty({ required: false, enum: ['Beginner', 'Intermediate', 'Advanced'], example: 'Intermediate' })
  level?: string;

  @ApiProperty({ required: false, enum: ['CPHQ Prep', 'CME Credits', 'Micro-Credential'], example: 'CPHQ Prep' })
  certificationType?: string;

  @ApiProperty({ required: false, example: 0, minimum: 0, description: 'Initial enrolled count' })
  enrolledCount?: number;

  @ApiProperty({ required: false, example: 4.8, minimum: 0, maximum: 5, description: 'Display rating (0–5) shown to students' })
  rating?: number;

  @ApiProperty({ required: false, example: 128, minimum: 0, description: 'Display review count shown to students' })
  reviewCount?: number;

  @ApiProperty({ required: false, example: 24, minimum: 0, description: 'Number of lessons' })
  lessons?: number;

  @ApiProperty({ required: false, description: 'Placeholder image URL or key' })
  imagePlaceholder?: string;

  @ApiProperty({ required: false, example: 'https://example.com/course.jpg', description: 'Course image URL' })
  imageUrl?: string;

  @ApiProperty({ required: false, description: 'Instructor image URL' })
  instructorImageUrl?: string;

  @ApiProperty({ required: false, description: 'Preview video URL' })
  videoPreviewUrl?: string;

  @ApiProperty({ required: false, description: 'SEO title' })
  seoTitle?: string;

  @ApiProperty({ required: false, description: 'SEO meta description' })
  seoDescription?: string;

  @ApiProperty({ required: false, description: 'SEO keywords' })
  seoKeywords?: string;

  @ApiProperty({
    required: false,
    type: [String],
    example: ['Master exam domains', 'Build quality dashboards'],
  })
  learningOutcomes?: string[];

  @ApiProperty({ required: false, type: [CurriculumSectionDto] })
  curriculumSections?: CurriculumSectionDto[];

  @ApiProperty({ required: false, type: [CourseReviewMediaItemDto] })
  reviewMedia?: CourseReviewMediaItemDto[];

  @ApiProperty({ required: false, example: true, description: 'Show this course in featured sections' })
  featured?: boolean;

  @ApiProperty({ required: false, example: 1, description: 'Lower numbers appear first in featured lists' })
  featuredOrder?: number;

  @ApiProperty({ required: false, type: [String], description: 'Explicitly related course ids' })
  relatedCourseIds?: string[];
}

export class ListCoursesResponseDto {
  @ApiProperty({ type: [ApiCourseDto] })
  items!: ApiCourseDto[];
}

export class CourseResponseDto {
  @ApiProperty({ type: ApiCourseDto })
  course!: ApiCourseDto;
}

export class PublicCoursesResponseDto extends ListCoursesResponseDto {}
