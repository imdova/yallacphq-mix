import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeadDocument = HydratedDocument<Lead>;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop()
  specialty?: string;

  @Prop({ default: 'general', enum: ['general', 'cphq', 'webinar'] })
  source!: 'general' | 'cphq' | 'webinar';

  @Prop()
  webinarId?: string;

  @Prop()
  webinarSlug?: string;

  @Prop()
  webinarTitle?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
