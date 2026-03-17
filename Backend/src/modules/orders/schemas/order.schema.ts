import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order> & {
  createdAt: Date;
  updatedAt: Date;
};

export type OrderStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentProvider = 'paymob' | 'stripe' | 'manual';
export type PaymentMethod = 'card' | 'wallet' | 'cash';

@Schema({ timestamps: true })
export class Order {
  /** User-facing order ID (e.g. #CPHQE-1A2B). Backfilled for old orders when missing. */
  @Prop()
  publicId?: string;

  @Prop({ required: true })
  studentName!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  studentEmail!: string;

  @Prop()
  studentPhone?: string;

  /** Set when order is created from checkout (authenticated user). Used to enroll on payment confirm. */
  @Prop()
  userId?: string;

  @Prop({ required: true })
  courseTitle!: string;

  @Prop({ required: true, default: 'usd' })
  currency!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop()
  discountAmount?: number;

  @Prop({ default: '' })
  promoCode?: string;

  @Prop({
    required: true,
    enum: ['paymob', 'stripe', 'manual'],
    default: 'manual',
  })
  provider!: PaymentProvider;

  @Prop({ enum: ['card', 'wallet', 'cash'] })
  paymentMethod?: PaymentMethod;

  @Prop({
    required: true,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'pending',
  })
  status!: OrderStatus;

  @Prop()
  transactionId?: string;

  @Prop({ type: [String], default: undefined })
  courseIds?: string[];

  /** URL of uploaded bank transfer receipt (when provider is manual). */
  @Prop()
  bankTransferProofUrl?: string;

  @Prop()
  paidAt?: string;

  @Prop()
  refundedAt?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ status: 1, createdAt: 1 });
