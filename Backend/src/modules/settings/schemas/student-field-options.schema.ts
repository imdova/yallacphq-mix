import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'studentfieldoptions', timestamps: true })
export class StudentFieldOptions {
  @Prop({ required: true, unique: true, default: 'default' })
  key!: string;

  @Prop({ type: [String], default: [] })
  countries!: string[];

  @Prop({ type: [String], default: [] })
  specialities!: string[];

  @Prop({ type: [String], default: [] })
  categories!: string[];
}

export const StudentFieldOptionsSchema = SchemaFactory.createForClass(StudentFieldOptions);
