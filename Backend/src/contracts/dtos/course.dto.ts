import { ApiProperty } from '@nestjs/swagger';

export enum CourseStatusDto {
  draft = 'draft',
  published = 'published',
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

  @ApiProperty({ required: false, example: 'usd' })
  currency?: string;
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
