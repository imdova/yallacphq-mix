import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatusDto {
  paid = 'paid',
  pending = 'pending',
  failed = 'failed',
  refunded = 'refunded',
}

export enum PaymentProviderDto {
  paymob = 'paymob',
  stripe = 'stripe',
  manual = 'manual',
}

export enum PaymentMethodDto {
  card = 'card',
  wallet = 'wallet',
  cash = 'cash',
}

export class ApiOrderDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10', description: 'Internal order identifier (MongoDB _id)' })
  id!: string;

  @ApiProperty({ example: '#CPHQE-1A2B', description: 'User-facing order ID' })
  publicId!: string;

  @ApiProperty({ example: 'Jane Student' })
  studentName!: string;

  @ApiProperty({ example: 'student@example.com', format: 'email' })
  studentEmail!: string;

  @ApiProperty({ required: false, example: '+45 12 34 56 78' })
  studentPhone?: string;

  @ApiProperty({ example: 'CPHQ Exam Prep 2026' })
  courseTitle!: string;

  @ApiProperty({ example: 'usd' })
  currency!: string;

  @ApiProperty({ example: 299, minimum: 0 })
  amount!: number;

  @ApiProperty({ required: false, example: 50, minimum: 0 })
  discountAmount?: number;

  @ApiProperty({ required: false, example: 'WELCOME10' })
  promoCode?: string;

  @ApiProperty({ enum: PaymentProviderDto, example: PaymentProviderDto.stripe })
  provider!: PaymentProviderDto;

  @ApiProperty({ required: false, enum: PaymentMethodDto })
  paymentMethod?: PaymentMethodDto;

  @ApiProperty({ enum: OrderStatusDto, example: OrderStatusDto.pending })
  status!: OrderStatusDto;

  @ApiProperty({ required: false, example: 'txn_123' })
  transactionId?: string;

  @ApiProperty({ required: false, type: [String], example: ['course-id-1'] })
  courseIds?: string[];

  @ApiProperty({ required: false, example: 'https://bucket.s3.region.amazonaws.com/bank-transfers/xxx.pdf' })
  bankTransferProofUrl?: string;

  @ApiProperty({ example: '2026-03-03T12:34:56.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-03T12:34:56.000Z' })
  updatedAt!: string;

  @ApiProperty({ required: false, example: '2026-03-03T12:40:00.000Z' })
  paidAt?: string;

  @ApiProperty({ required: false, example: '2026-03-10T12:40:00.000Z' })
  refundedAt?: string;
}

export class ListOrdersResponseDto {
  @ApiProperty({ type: [ApiOrderDto] })
  items!: ApiOrderDto[];
}
