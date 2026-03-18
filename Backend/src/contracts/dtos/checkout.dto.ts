import { ApiProperty } from '@nestjs/swagger';
import { ApiOrderDto, OrderStatusDto, PaymentProviderDto } from './order.dto';

export enum CheckoutPaymentMethodDto {
  paypal = 'paypal',
  card = 'card',
  bank = 'bank',
  paymob = 'paymob',
}

export class CreatePaymentSessionBodyDto {
  @ApiProperty({
    enum: CheckoutPaymentMethodDto,
    example: CheckoutPaymentMethodDto.card,
  })
  method!: CheckoutPaymentMethodDto;

  @ApiProperty({ example: 'CPHQ Exam Prep 2026', minLength: 1 })
  courseTitle!: string;

  @ApiProperty({ required: false, example: 'Jane Student' })
  studentName?: string;

  @ApiProperty({ required: false, example: 'student@example.com' })
  studentEmail?: string;

  @ApiProperty({ required: false, example: '+201001234567' })
  studentPhone?: string;

  @ApiProperty({ required: false, example: 'usd' })
  currency?: string;

  @ApiProperty({ example: 299, minimum: 0 })
  amount!: number;

  @ApiProperty({ required: false, example: 50, minimum: 0 })
  discountAmount?: number;

  @ApiProperty({ required: false, example: 'WELCOME10' })
  promoCode?: string;

  @ApiProperty({ required: false, minLength: 8, example: 'idem_12345678' })
  idempotencyKey?: string;

  @ApiProperty({ required: false, type: [String], example: ['course-id-1'] })
  courseIds?: string[];

  @ApiProperty({ required: false, example: 'https://bucket.s3.region.amazonaws.com/bank-transfers/xxx.pdf' })
  bankTransferProofUrl?: string;

  @ApiProperty({
    required: false,
    enum: ['card', 'ewallet', 'kiosk'],
    description: 'When method is paymob: which integration to use. Omit to use all configured.',
  })
  paymobIntegrationType?: 'card' | 'ewallet' | 'kiosk';
}

export class CreatePaymentSessionResponseDto {
  @ApiProperty({ example: 'sess_123' })
  sessionId!: string;

  @ApiProperty({ enum: PaymentProviderDto, example: PaymentProviderDto.stripe })
  provider!: PaymentProviderDto;

  @ApiProperty({ type: ApiOrderDto })
  order!: ApiOrderDto;

  @ApiProperty({
    required: false,
    example: '/set-password?email=student%40example.com&auto=1&next=%2Fdashboard%2Fcourses',
  })
  postCheckoutNextPath?: string;
}

export class ConfirmPaymentBodyDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10', minLength: 1 })
  orderId!: string;

  @ApiProperty({
    required: false,
    enum: OrderStatusDto,
    example: OrderStatusDto.paid,
  })
  status?: OrderStatusDto;

  @ApiProperty({ required: false, example: 'txn_123' })
  transactionId?: string;
}

export class ConfirmPaymentResponseDto {
  @ApiProperty({ example: true })
  ok!: true;

  @ApiProperty({ type: ApiOrderDto })
  order!: ApiOrderDto;
}
