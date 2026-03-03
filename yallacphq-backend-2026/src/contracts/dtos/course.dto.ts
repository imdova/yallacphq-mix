import { ApiProperty } from '@nestjs/swagger';

export enum CourseStatusDto {
  draft = 'draft',
  published = 'published',
}

export enum CourseVisibilityDto {
  public = 'public',
  private = 'private',
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

  @ApiProperty({
    required: false,
    enum: CourseVisibilityDto,
    example: CourseVisibilityDto.public,
  })
  visibility?: CourseVisibilityDto;

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
  @ApiProperty({ example: 'CPHQ Exam Prep 2026', minLength: 1 })
  title!: string;

  @ApiProperty({ example: 'CPHQ', minLength: 1 })
  tag!: string;

  @ApiProperty({ example: 'Dr. A. Instructor', minLength: 1 })
  instructorName!: string;

  @ApiProperty({ example: 'Quality Director', minLength: 1 })
  instructorTitle!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  durationHours!: number;

  @ApiProperty({ required: false, enum: CourseStatusDto })
  status?: CourseStatusDto;

  @ApiProperty({ required: false, enum: CourseVisibilityDto })
  visibility?: CourseVisibilityDto;

  @ApiProperty({ required: false, example: 'A complete course to prepare...' })
  description?: string;
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
