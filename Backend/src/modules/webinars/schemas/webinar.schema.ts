import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebinarDocument = HydratedDocument<Webinar>;

@Schema({ _id: false })
export class WebinarLearnPoint {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;
}

export const WebinarLearnPointSchema =
  SchemaFactory.createForClass(WebinarLearnPoint);

@Schema({ _id: false })
export class WebinarStat {
  @Prop({ required: true, trim: true })
  id!: string;

  @Prop({ required: true, trim: true })
  value!: string;

  @Prop({ required: true, trim: true })
  label!: string;
}

export const WebinarStatSchema = SchemaFactory.createForClass(WebinarStat);

@Schema({ timestamps: true })
export class Webinar {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  slug!: string;

  @Prop({ default: '' })
  excerpt!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft' })
  status!: 'draft' | 'published';

  @Prop({ required: true, type: Date })
  startsAt!: Date;

  @Prop({ required: true, default: 'GMT+3' })
  timezoneLabel!: string;

  @Prop({ required: true, trim: true })
  speakerName!: string;

  @Prop({ default: '' })
  speakerTitle!: string;

  @Prop({ default: '' })
  coverImageUrl!: string;

  @Prop({ default: '' })
  videoUrl!: string;

  @Prop({ required: true, default: true })
  registrationEnabled!: boolean;

  @Prop({ type: Number, default: null, min: 0 })
  seatsLeft!: number | null;

  @Prop({ required: true, default: false })
  isFeatured!: boolean;

  @Prop({ type: [WebinarLearnPointSchema], default: [] })
  learnPoints!: WebinarLearnPoint[];

  @Prop({ type: [String], default: [] })
  trustedBy!: string[];

  @Prop({ type: [WebinarStatSchema], default: [] })
  stats!: WebinarStat[];
}

export const WebinarSchema = SchemaFactory.createForClass(Webinar);
