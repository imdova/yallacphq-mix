import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/auth/role';

export type UserDocument = HydratedDocument<User> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: Role, default: Role.student })
  role!: Role;

  @Prop({ default: false })
  enrolled?: boolean;

  @Prop()
  phone?: string;

  @Prop()
  course?: string;

  @Prop()
  country?: string;

  @Prop()
  speciality?: string;

  @Prop()
  profileImageUrl?: string;

  @Prop({ type: [String], default: undefined })
  enrolledCourseIds?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
