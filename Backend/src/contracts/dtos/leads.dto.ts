import { ApiProperty } from '@nestjs/swagger';

export class LeadCreateBodyDto {
  @ApiProperty({ example: 'Jane Student', minLength: 1 })
  name!: string;

  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: '+45 12 34 56 78', minLength: 5 })
  phone!: string;

  @ApiProperty({
    required: false,
    description: 'Optional specialty field (legacy routes may require it)',
    example: 'Quality Improvement',
  })
  specialty?: string;

  @ApiProperty({
    required: false,
    description: 'Optional webinar id for webinar registrations',
    example: '67d7f4f2c0db52c8f0ce1234',
  })
  webinarId?: string;

  @ApiProperty({
    required: false,
    description: 'Optional webinar slug for webinar registrations',
    example: 'master-cphq-in-60-minutes',
  })
  webinarSlug?: string;

  @ApiProperty({
    required: false,
    description: 'Optional webinar title for webinar registrations',
    example: 'Master CPHQ in 60 Minutes',
  })
  webinarTitle?: string;
}

export class LeadSubmitResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ required: false, example: 'Submitted successfully' })
  message?: string;

  @ApiProperty({
    required: false,
    description: 'Field-level errors',
    example: { email: 'Email is invalid' },
  })
  errors?: Record<string, string>;
}
