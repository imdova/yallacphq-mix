import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  text!: string;
}

export const QuizOptionSchema = SchemaFactory.createForClass(QuizOption);

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  id!: string;

  @Prop({
    required: true,
    enum: ['multiple-choice', 'multiple-select', 'true-false', 'short-answer'],
  })
  questionType!:
    | 'multiple-choice'
    | 'multiple-select'
    | 'true-false'
    | 'short-answer';

  @Prop({ required: true })
  prompt!: string;

  @Prop({ type: [QuizOptionSchema], default: undefined })
  options?: QuizOption[];

  @Prop()
  correctOptionId?: string;

  @Prop({ type: [String], default: undefined })
  correctOptionIds?: string[];

  @Prop()
  correctBoolean?: boolean;

  @Prop({ type: [String], default: undefined })
  acceptableAnswers?: string[];

  @Prop({ required: true, min: 1, default: 1 })
  points!: number;

  @Prop()
  rationale?: string;
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ _id: false })
export class QuizMeta {
  @Prop({ required: true, min: 1, max: 240 })
  durationMinutes!: number;

  @Prop({ required: true, min: 0, max: 100 })
  passingScorePercent!: number;
}

export const QuizMetaSchema = SchemaFactory.createForClass(QuizMeta);

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  module!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, enum: ['active', 'draft'], default: 'draft' })
  status!: 'active' | 'draft';

  @Prop({ type: QuizMetaSchema, required: true })
  meta!: QuizMeta;

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questionBank!: QuizQuestion[];

  @Prop({ type: Types.ObjectId, required: false })
  createdByUserId?: Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
