import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromoCodeDocument = HydratedDocument<PromoCode>;

@Schema({ timestamps: true })
export class PromoCode {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code!: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  discountType!: 'percentage' | 'fixed';

  @Prop({ required: true, min: 0 })
  discountValue!: number;

  @Prop({ default: true })
  active!: boolean;

  @Prop({ default: false })
  maxUsageEnabled!: boolean;

  @Prop({ type: Number, default: null })
  maxUsage!: number | null;

  @Prop({ default: false })
  perCustomerLimitEnabled!: boolean;

  @Prop({ type: Number, default: null })
  perCustomerLimit!: number | null;

  @Prop({ default: false })
  restrictToProductEnabled!: boolean;

  @Prop({ type: String, default: null })
  productId!: string | null;

  @Prop({ default: 0 })
  usageCount!: number;
}

export const PromoCodeSchema = SchemaFactory.createForClass(PromoCode);
