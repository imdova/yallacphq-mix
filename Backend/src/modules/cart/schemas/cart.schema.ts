import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CartDocument = HydratedDocument<Cart> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ type: [String], default: [] })
  courseIds!: string[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
