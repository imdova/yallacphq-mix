import { ApiProperty } from '@nestjs/swagger';

export class ApiIssueDto {
  @ApiProperty({
    description: 'Location of the invalid value',
    example: ['email'],
    type: [String],
  })
  path!: Array<string | number>;

  @ApiProperty({
    description: 'Human-readable validation message',
    example: 'Invalid email address',
  })
  message!: string;
}

export class ApiErrorDto {
  @ApiProperty({
    description: 'Error message suitable for UI display',
    example: 'Validation error',
  })
  message!: string;

  @ApiProperty({
    description: 'Optional machine-readable error code',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Optional structured validation issues',
    required: false,
    type: [ApiIssueDto],
  })
  issues?: ApiIssueDto[];
}

export class ApiOkDto {
  @ApiProperty({ example: true })
  ok!: true;
}

export class ApiSuccessDto {
  @ApiProperty({ example: true })
  success!: true;
}
