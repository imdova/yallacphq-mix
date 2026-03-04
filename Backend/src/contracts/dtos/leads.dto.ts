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
