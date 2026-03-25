import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebinarLearnPointDto {
  @ApiProperty({ example: 'lp_exam-blueprints' })
  id!: string;

  @ApiProperty({ example: 'Exam Blueprints' })
  title!: string;

  @ApiProperty({
    example:
      'Understand the key CPHQ domains and the most common exam scenarios.',
  })
  description!: string;
}

export class WebinarStatDto {
  @ApiProperty({ example: '500+' })
  value!: string;

  @ApiProperty({ example: 'Registered learners' })
  label!: string;

  @ApiProperty({ example: 'stat_registered' })
  id!: string;
}

export class ApiWebinarDto {
  @ApiProperty({ example: '67d7f4f2c0db52c8f0ce1234' })
  id!: string;

  @ApiProperty({ example: 'Master CPHQ in 60 Minutes' })
  title!: string;

  @ApiProperty({ example: 'master-cphq-in-60-minutes' })
  slug!: string;

  @ApiProperty({
    example:
      'A free live session covering exam strategy, quality tools, and a Q&A with a CPHQ expert.',
  })
  excerpt!: string;

  @ApiProperty({
    example:
      'Join our live webinar to review the core exam domains, practical quality tools, and your best preparation path.',
  })
  description!: string;

  @ApiProperty({ enum: ['draft', 'published'], example: 'published' })
  status!: 'draft' | 'published';

  @ApiProperty({ example: '2026-03-25T17:00:00.000Z' })
  startsAt!: string;

  @ApiProperty({ example: 'GMT+3' })
  timezoneLabel!: string;

  @ApiProperty({ example: 'Dr. Jane Smith' })
  speakerName!: string;

  @ApiProperty({ example: 'CPHQ Expert' })
  speakerTitle!: string;

  @ApiProperty({ example: 'https://images.example.com/webinar-cover.jpg' })
  coverImageUrl!: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=R9-6cBqzczo',
  })
  videoUrl!: string;

  @ApiProperty({ example: true })
  registrationEnabled!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 25 })
  seatsLeft!: number | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ type: [WebinarLearnPointDto] })
  learnPoints!: WebinarLearnPointDto[];

  @ApiProperty({ type: [String], example: ['HealthCorp', 'Global Clinic'] })
  trustedBy!: string[];

  @ApiProperty({ type: [WebinarStatDto] })
  stats!: WebinarStatDto[];

  @ApiProperty({ example: '2026-03-17T18:40:12.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-18T09:12:41.000Z' })
  lastUpdated!: string;
}

export class CreateWebinarBodyDto {
  @ApiProperty({ example: 'Master CPHQ in 60 Minutes' })
  title!: string;

  @ApiProperty({ example: 'master-cphq-in-60-minutes' })
  slug!: string;

  @ApiProperty({
    example:
      'A free live session covering exam strategy, quality tools, and a Q&A with a CPHQ expert.',
  })
  excerpt!: string;

  @ApiProperty({
    example:
      'Join our live webinar to review the core exam domains, practical quality tools, and your best preparation path.',
  })
  description!: string;

  @ApiProperty({ enum: ['draft', 'published'], example: 'draft' })
  status!: 'draft' | 'published';

  @ApiProperty({ example: '2026-03-25T17:00:00.000Z' })
  startsAt!: string;

  @ApiProperty({ example: 'GMT+3' })
  timezoneLabel!: string;

  @ApiProperty({ example: 'Dr. Jane Smith' })
  speakerName!: string;

  @ApiProperty({ example: 'CPHQ Expert' })
  speakerTitle!: string;

  @ApiProperty({ example: 'https://images.example.com/webinar-cover.jpg' })
  coverImageUrl!: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=R9-6cBqzczo',
  })
  videoUrl!: string;

  @ApiProperty({ example: true })
  registrationEnabled!: boolean;

  @ApiPropertyOptional({ nullable: true, example: 25 })
  seatsLeft!: number | null;

  @ApiProperty({ example: true })
  isFeatured!: boolean;

  @ApiProperty({ type: [WebinarLearnPointDto] })
  learnPoints!: WebinarLearnPointDto[];

  @ApiProperty({ type: [String], example: ['HealthCorp', 'Global Clinic'] })
  trustedBy!: string[];

  @ApiProperty({ type: [WebinarStatDto] })
  stats!: WebinarStatDto[];
}

export class UpdateWebinarBodyDto {
  @ApiPropertyOptional({ example: 'Master CPHQ in 60 Minutes' })
  title?: string;

  @ApiPropertyOptional({ example: 'master-cphq-in-60-minutes' })
  slug?: string;

  @ApiPropertyOptional({
    example:
      'A free live session covering exam strategy, quality tools, and a Q&A with a CPHQ expert.',
  })
  excerpt?: string;

  @ApiPropertyOptional({
    example:
      'Join our live webinar to review the core exam domains, practical quality tools, and your best preparation path.',
  })
  description?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'], example: 'draft' })
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: '2026-03-25T17:00:00.000Z' })
  startsAt?: string;

  @ApiPropertyOptional({ example: 'GMT+3' })
  timezoneLabel?: string;

  @ApiPropertyOptional({ example: 'Dr. Jane Smith' })
  speakerName?: string;

  @ApiPropertyOptional({ example: 'CPHQ Expert' })
  speakerTitle?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/webinar-cover.jpg' })
  coverImageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://www.youtube.com/watch?v=R9-6cBqzczo',
  })
  videoUrl?: string;

  @ApiPropertyOptional({ example: true })
  registrationEnabled?: boolean;

  @ApiPropertyOptional({ nullable: true, example: 25 })
  seatsLeft?: number | null;

  @ApiPropertyOptional({ example: true })
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [WebinarLearnPointDto] })
  learnPoints?: WebinarLearnPointDto[];

  @ApiPropertyOptional({ type: [String], example: ['HealthCorp', 'Global Clinic'] })
  trustedBy?: string[];

  @ApiPropertyOptional({ type: [WebinarStatDto] })
  stats?: WebinarStatDto[];
}

export class ListWebinarsResponseDto {
  @ApiProperty({ type: [ApiWebinarDto] })
  items!: ApiWebinarDto[];
}

export class WebinarResponseDto {
  @ApiProperty({ type: ApiWebinarDto })
  webinar!: ApiWebinarDto;
}

export class WebinarNullableResponseDto {
  @ApiPropertyOptional({ type: ApiWebinarDto, nullable: true })
  webinar!: ApiWebinarDto | null;
}
